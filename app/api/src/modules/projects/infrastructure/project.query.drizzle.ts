import { asc, and, desc, eq, isNull, sql, type AnyColumn } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { projects, contacts, users, projectResponsibles } from '@shared/db/schema'
import { applyFilterGroups, applySearch, combineWhere } from '@shared/db/drizzle-filters'
import { projectColumnMap, projectSearchCols } from '@modules/projects/infrastructure/project.resource'
import type { ProjectQueries, ProjectListInput, ProjectListItem, ProjectResponsibleRef } from '@modules/projects/application/project.query'
import type { Page } from '@shared/types/pagination'
import type { ProjectStatus } from '@modules/projects/domain/types/project-status'
import type { ProjectResponsibleRole } from '@modules/projects/domain/types/project-responsible-role'

export class DrizzleProjectQueries implements ProjectQueries {
  constructor(private readonly db: Db) {}

  async list(input: ProjectListInput): Promise<Page<ProjectListItem>> {
    const where = combineWhere([
      isNull(projects.deletedAt),
      applyFilterGroups(projectColumnMap, input.filterGroups),
      applySearch(projectSearchCols, input.search),
    ])

    const sortableMap = projectColumnMap as Record<string, AnyColumn>
    const sortCol = input.sort ? sortableMap[input.sort.field] : undefined
    const orderExpr = sortCol
      ? input.sort!.dir === 'asc'
        ? asc(sortCol)
        : desc(sortCol)
      : desc(projects.createdAt)

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projects)
        .where(where),
      this.db
        .select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          contactId: projects.contactId,
          contactName: contacts.name,
          currency: projects.currency,
          status: projects.status,
          startDate: projects.startDate,
          plannedEndDate: projects.plannedEndDate,
          createdBy: projects.createdBy,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
        })
        .from(projects)
        .leftJoin(contacts, and(eq(contacts.id, projects.contactId), isNull(contacts.deletedAt)))
        .where(where)
        .orderBy(orderExpr)
        .limit(input.pagination.limit)
        .offset(input.pagination.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)

    if (rows.length === 0) {
      return { items: [], total, limit: input.pagination.limit, offset: input.pagination.offset }
    }

    const projectIds = rows.map((r) => r.id)

    const responsiblesRows = await this.db
      .select({
        projectId: projectResponsibles.projectId,
        userId: projectResponsibles.userId,
        userName: users.name,
        role: projectResponsibles.role,
      })
      .from(projectResponsibles)
      .innerJoin(users, eq(users.id, projectResponsibles.userId))
      .where(
        projectIds.length === 1
          ? eq(projectResponsibles.projectId, projectIds[0]!)
          : sql`${projectResponsibles.projectId} = ANY(ARRAY[${sql.join(projectIds.map((id) => sql`${id}::uuid`), sql`, `)}])`
      )
      .orderBy(asc(projectResponsibles.assignedAt))

    const responsiblesByProject = new Map<string, ProjectResponsibleRef[]>()
    const responsiblesCountByProject = new Map<string, number>()

    for (const r of responsiblesRows) {
      if (!responsiblesByProject.has(r.projectId)) {
        responsiblesByProject.set(r.projectId, [])
        responsiblesCountByProject.set(r.projectId, 0)
      }
      const count = responsiblesCountByProject.get(r.projectId) ?? 0
      responsiblesCountByProject.set(r.projectId, count + 1)
      if (r.role === 'Lead') {
        responsiblesByProject.get(r.projectId)!.push({
          userId: r.userId,
          userName: r.userName,
          role: r.role as ProjectResponsibleRole,
        })
      }
    }

    const items: ProjectListItem[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      contactId: row.contactId,
      contactName: row.contactName ?? null,
      currency: row.currency,
      status: row.status as ProjectStatus,
      startDate: row.startDate,
      plannedEndDate: row.plannedEndDate,
      createdBy: row.createdBy,
      responsiblesCount: responsiblesCountByProject.get(row.id) ?? 0,
      leads: responsiblesByProject.get(row.id) ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))

    return { items, total, limit: input.pagination.limit, offset: input.pagination.offset }
  }
}
