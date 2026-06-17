import { asc, and, desc, eq, gte, isNull, lt, sql, type AnyColumn } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { projects, contacts, users, projectResponsibles, projectStateChanges } from '@shared/db/schema'
import { applyFilterGroups, applySearch, combineWhere } from '@shared/db/drizzle-filters'
import { projectColumnMap, projectSearchCols } from '@modules/projects/infrastructure/project.resource'
import type { ProjectQueries, ProjectListInput, ProjectListItem, ProjectResponsibleRef, ProjectKpisResult, ProjectCreatorRef } from '@modules/projects/application/project.query'
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
          createdByName: users.name,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
        })
        .from(projects)
        .leftJoin(contacts, and(eq(contacts.id, projects.contactId), isNull(contacts.deletedAt)))
        .leftJoin(users, eq(users.id, projects.createdBy))
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
      createdByName: row.createdByName ?? null,
      responsiblesCount: responsiblesCountByProject.get(row.id) ?? 0,
      leads: responsiblesByProject.get(row.id) ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))

    return { items, total, limit: input.pagination.limit, offset: input.pagination.offset }
  }

  async findCreatorRef(userId: string): Promise<ProjectCreatorRef | null> {
    const rows = await this.db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    const row = rows[0]
    return row ? { id: row.id, name: row.name } : null
  }

  async kpis(): Promise<ProjectKpisResult> {
    const now = new Date()
    const minus30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const minus60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const [
      draftCurrent,
      draftPrevious,
      activeCurrent,
      activePrevious,
      closedCurrent,
      closedPrevious,
      cancelledCurrent,
      cancelledPrevious,
      totalStock,
    ] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projects)
        .where(and(isNull(projects.deletedAt), gte(projects.createdAt, minus30), lt(projects.createdAt, now))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projects)
        .where(and(isNull(projects.deletedAt), gte(projects.createdAt, minus60), lt(projects.createdAt, minus30))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projectStateChanges)
        .innerJoin(projects, and(sql`${projectStateChanges.projectId} = ${projects.id}`, isNull(projects.deletedAt)))
        .where(and(sql`${projectStateChanges.nextState} = 'Active'`, gte(projectStateChanges.changedAt, minus30), lt(projectStateChanges.changedAt, now))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projectStateChanges)
        .innerJoin(projects, and(sql`${projectStateChanges.projectId} = ${projects.id}`, isNull(projects.deletedAt)))
        .where(and(sql`${projectStateChanges.nextState} = 'Active'`, gte(projectStateChanges.changedAt, minus60), lt(projectStateChanges.changedAt, minus30))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projectStateChanges)
        .innerJoin(projects, and(sql`${projectStateChanges.projectId} = ${projects.id}`, isNull(projects.deletedAt)))
        .where(and(sql`${projectStateChanges.nextState} = 'Closed'`, gte(projectStateChanges.changedAt, minus30), lt(projectStateChanges.changedAt, now))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projectStateChanges)
        .innerJoin(projects, and(sql`${projectStateChanges.projectId} = ${projects.id}`, isNull(projects.deletedAt)))
        .where(and(sql`${projectStateChanges.nextState} = 'Closed'`, gte(projectStateChanges.changedAt, minus60), lt(projectStateChanges.changedAt, minus30))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projectStateChanges)
        .innerJoin(projects, and(sql`${projectStateChanges.projectId} = ${projects.id}`, isNull(projects.deletedAt)))
        .where(and(sql`${projectStateChanges.nextState} = 'Cancelled'`, gte(projectStateChanges.changedAt, minus30), lt(projectStateChanges.changedAt, now))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projectStateChanges)
        .innerJoin(projects, and(sql`${projectStateChanges.projectId} = ${projects.id}`, isNull(projects.deletedAt)))
        .where(and(sql`${projectStateChanges.nextState} = 'Cancelled'`, gte(projectStateChanges.changedAt, minus60), lt(projectStateChanges.changedAt, minus30))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projects)
        .where(isNull(projects.deletedAt)),
    ])

    return {
      total: {
        count: Number(totalStock[0]?.count ?? 0),
        current: Number(draftCurrent[0]?.count ?? 0),
        previous: Number(draftPrevious[0]?.count ?? 0),
      },
      states: [
        { state: 'Draft', current: Number(draftCurrent[0]?.count ?? 0), previous: Number(draftPrevious[0]?.count ?? 0) },
        { state: 'Active', current: Number(activeCurrent[0]?.count ?? 0), previous: Number(activePrevious[0]?.count ?? 0) },
        { state: 'Closed', current: Number(closedCurrent[0]?.count ?? 0), previous: Number(closedPrevious[0]?.count ?? 0) },
        { state: 'Cancelled', current: Number(cancelledCurrent[0]?.count ?? 0), previous: Number(cancelledPrevious[0]?.count ?? 0) },
      ],
    }
  }
}
