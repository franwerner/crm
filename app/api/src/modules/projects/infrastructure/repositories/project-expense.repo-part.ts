import { asc, desc, eq, sql, type AnyColumn } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { projectExpenses, projects } from '@shared/db/schema'
import type { Project } from '@modules/projects/domain/project'
import type { ProjectExpense } from '@modules/projects/domain/entities/project-expense'
import type { Page } from '@shared/types/pagination'
import type { ListQuery } from '@shared/types/filters'
import { applyFilterGroups, combineWhere } from '@shared/db/drizzle-filters'
import { expenseColumnMap } from '@modules/projects/infrastructure/project.resource'

type ProjectExpenseRow = typeof projectExpenses.$inferSelect

export function toProjectExpense(row: ProjectExpenseRow): ProjectExpense {
  return {
    id: row.id,
    projectId: row.projectId,
    concept: row.concept,
    amountMinor: row.amountMinor,
    incurredAt: row.incurredAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function toExpenseRow(expense: ProjectExpense): typeof projectExpenses.$inferInsert {
  return {
    id: expense.id,
    projectId: expense.projectId,
    concept: expense.concept,
    amountMinor: expense.amountMinor,
    incurredAt: expense.incurredAt,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  }
}

export class ProjectExpenseRepoPart {
  constructor(private readonly db: Db) {}

  async addExpense(project: Project, expense: ProjectExpense): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(projectExpenses).values(toExpenseRow(expense))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async updateExpense(project: Project, expenseId: string): Promise<void> {
    const expense = project.expenses.find((e) => e.id === expenseId)
    if (!expense) return

    await this.db.transaction(async (tx) => {
      await tx
        .update(projectExpenses)
        .set({
          concept: expense.concept,
          amountMinor: expense.amountMinor,
          incurredAt: expense.incurredAt,
          updatedAt: expense.updatedAt,
        })
        .where(eq(projectExpenses.id, expenseId))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async removeExpense(project: Project, expenseId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(projectExpenses).where(eq(projectExpenses.id, expenseId))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async findExpenses(projectId: string, params: ListQuery): Promise<Page<ProjectExpense>> {
    const projectGuard = eq(projectExpenses.projectId, projectId)
    const filterClause = applyFilterGroups(expenseColumnMap, params.filterGroups)
    const where = combineWhere([projectGuard, filterClause])

    const sortableMap = expenseColumnMap as Record<string, AnyColumn>
    const sortCol = params.sort ? sortableMap[params.sort.field] : undefined
    const orderExpr = sortCol
      ? params.sort!.dir === 'asc'
        ? asc(sortCol)
        : desc(sortCol)
      : desc(projectExpenses.createdAt)

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projectExpenses)
        .where(where),
      this.db
        .select()
        .from(projectExpenses)
        .where(where)
        .orderBy(orderExpr)
        .limit(params.pagination.limit)
        .offset(params.pagination.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items = rows.map(toProjectExpense)

    return { items, total, limit: params.pagination.limit, offset: params.pagination.offset }
  }
}
