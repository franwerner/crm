import { asc, desc, eq, sql, type AnyColumn } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { projectBudgetItems, projects } from '@shared/db/schema'
import type { Project } from '@modules/projects/domain/project'
import type { ProjectBudgetItem } from '@modules/projects/domain/entities/project-budget-item'
import type { Page } from '@shared/types/pagination'
import type { ListQuery } from '@shared/types/filters'
import { applyFilterGroups, combineWhere } from '@shared/db/drizzle-filters'
import { budgetItemColumnMap } from '@modules/projects/infrastructure/project.resource'

type ProjectBudgetItemRow = typeof projectBudgetItems.$inferSelect

export function toProjectBudgetItem(row: ProjectBudgetItemRow): ProjectBudgetItem {
  return {
    id: row.id,
    projectId: row.projectId,
    concept: row.concept,
    amountMinor: row.amountMinor,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function toBudgetItemRow(item: ProjectBudgetItem): typeof projectBudgetItems.$inferInsert {
  return {
    id: item.id,
    projectId: item.projectId,
    concept: item.concept,
    amountMinor: item.amountMinor,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export class ProjectBudgetRepoPart {
  constructor(private readonly db: Db) {}

  async addBudgetItem(project: Project, item: ProjectBudgetItem): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(projectBudgetItems).values(toBudgetItemRow(item))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async updateBudgetItem(project: Project, itemId: string): Promise<void> {
    const item = project.budgetItems.find((i) => i.id === itemId)
    if (!item) return

    await this.db.transaction(async (tx) => {
      await tx
        .update(projectBudgetItems)
        .set({ concept: item.concept, amountMinor: item.amountMinor, updatedAt: item.updatedAt })
        .where(eq(projectBudgetItems.id, itemId))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async removeBudgetItem(project: Project, itemId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(projectBudgetItems).where(eq(projectBudgetItems.id, itemId))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async findBudgetItems(projectId: string, params: ListQuery): Promise<Page<ProjectBudgetItem>> {
    const projectGuard = eq(projectBudgetItems.projectId, projectId)
    const filterClause = applyFilterGroups(budgetItemColumnMap, params.filterGroups)
    const where = combineWhere([projectGuard, filterClause])

    const sortableMap = budgetItemColumnMap as Record<string, AnyColumn>
    const sortCol = params.sort ? sortableMap[params.sort.field] : undefined
    const orderExpr = sortCol
      ? params.sort!.dir === 'asc'
        ? asc(sortCol)
        : desc(sortCol)
      : desc(projectBudgetItems.createdAt)

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projectBudgetItems)
        .where(where),
      this.db
        .select()
        .from(projectBudgetItems)
        .where(where)
        .orderBy(orderExpr)
        .limit(params.pagination.limit)
        .offset(params.pagination.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items = rows.map(toProjectBudgetItem)

    return { items, total, limit: params.pagination.limit, offset: params.pagination.offset }
  }
}
