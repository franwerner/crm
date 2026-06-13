import { asc, desc, eq, sql, type AnyColumn } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { projectExtensions, projects } from '@shared/db/schema'
import type { Project } from '@modules/projects/domain/project'
import type { ProjectExtension } from '@modules/projects/domain/entities/project-extension'
import type { Page } from '@shared/types/pagination'
import type { ListQuery } from '@shared/types/filters'
import { applyFilterGroups, combineWhere } from '@shared/db/drizzle-filters'
import { extensionColumnMap } from '@modules/projects/infrastructure/project.resource'

type ProjectExtensionRow = typeof projectExtensions.$inferSelect

export function toProjectExtension(row: ProjectExtensionRow): ProjectExtension {
  return {
    id: row.id,
    projectId: row.projectId,
    additionalDays: row.additionalDays,
    appliedEndDate: row.appliedEndDate,
    reason: row.reason,
    cost: row.costMinor,
    billedAmount: row.billedAmountMinor,
    grantedAt: row.grantedAt,
    grantedBy: row.grantedBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export class ProjectExtensionRepoPart {
  constructor(private readonly db: Db) {}

  private async recalcExtensions(
    tx: Parameters<Parameters<typeof this.db.transaction>[0]>[0],
    projectId: string,
  ): Promise<void> {
    const projectRow = await tx.query.projects.findFirst({ where: eq(projects.id, projectId) })
    if (!projectRow) return

    const originalEnd = projectRow.originalPlannedEndDate
    const allExtensions = await tx
      .select()
      .from(projectExtensions)
      .where(eq(projectExtensions.projectId, projectId))
      .orderBy(asc(projectExtensions.grantedAt), asc(projectExtensions.createdAt))

    let runningDays = 0
    for (const ext of allExtensions) {
      runningDays += ext.additionalDays
      const appliedEndDate = new Date(originalEnd)
      appliedEndDate.setUTCDate(appliedEndDate.getUTCDate() + runningDays)
      await tx
        .update(projectExtensions)
        .set({ appliedEndDate, updatedAt: new Date() })
        .where(eq(projectExtensions.id, ext.id))
    }

    const finalDate = new Date(originalEnd)
    finalDate.setUTCDate(finalDate.getUTCDate() + runningDays)
    await tx
      .update(projects)
      .set({ plannedEndDate: finalDate, updatedAt: new Date() })
      .where(eq(projects.id, projectId))
  }

  async addExtension(project: Project, extension: ProjectExtension): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(projectExtensions).values({
        id: extension.id,
        projectId: extension.projectId,
        additionalDays: extension.additionalDays,
        appliedEndDate: extension.appliedEndDate,
        reason: extension.reason,
        costMinor: extension.cost,
        billedAmountMinor: extension.billedAmount,
        grantedAt: extension.grantedAt,
        grantedBy: extension.grantedBy,
        createdAt: extension.createdAt,
        updatedAt: extension.updatedAt,
      })
      await this.recalcExtensions(tx, project.id)
    })
  }

  async updateExtension(project: Project, extId: string): Promise<void> {
    const ext = project.extensions.find((e) => e.id === extId)
    if (!ext) return

    await this.db.transaction(async (tx) => {
      await tx
        .update(projectExtensions)
        .set({
          additionalDays: ext.additionalDays,
          reason: ext.reason,
          costMinor: ext.cost,
          billedAmountMinor: ext.billedAmount,
          grantedAt: ext.grantedAt,
          updatedAt: ext.updatedAt,
        })
        .where(eq(projectExtensions.id, extId))
      await this.recalcExtensions(tx, project.id)
    })
  }

  async removeExtension(project: Project, extId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(projectExtensions).where(eq(projectExtensions.id, extId))
      await this.recalcExtensions(tx, project.id)
    })
  }

  async findExtensions(projectId: string, params: ListQuery): Promise<Page<ProjectExtension>> {
    const projectGuard = eq(projectExtensions.projectId, projectId)
    const filterClause = applyFilterGroups(extensionColumnMap, params.filterGroups)
    const where = combineWhere([projectGuard, filterClause])

    const sortableMap = extensionColumnMap as Record<string, AnyColumn>
    const sortCol = params.sort ? sortableMap[params.sort.field] : undefined
    const orderExpr = sortCol
      ? params.sort!.dir === 'asc'
        ? asc(sortCol)
        : desc(sortCol)
      : desc(projectExtensions.createdAt)

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projectExtensions)
        .where(where),
      this.db
        .select()
        .from(projectExtensions)
        .where(where)
        .orderBy(orderExpr)
        .limit(params.pagination.limit)
        .offset(params.pagination.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items = rows.map(toProjectExtension)

    return { items, total, limit: params.pagination.limit, offset: params.pagination.offset }
  }
}
