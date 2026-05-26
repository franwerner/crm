import { and, asc, desc, eq, inArray, isNull, sql, type AnyColumn } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { projects, projectStateChanges, projectResponsibles, users, projectBudgetItems, projectExpenses, projectExtensions, projectDocuments } from '@shared/db/schema'
import { Project } from '@modules/projects/domain/project'
import type { ProjectStatus } from '@modules/projects/domain/types/project-status'
import type { ProjectResponsibleRole } from '@modules/projects/domain/types/project-responsible-role'
import type { StateChangeCause } from '@modules/projects/domain/types/state-change-cause'
import type { ProjectStateChange } from '@modules/projects/domain/entities/project-state-change'
import type { ProjectResponsible } from '@modules/projects/domain/entities/project-responsible'
import type { ProjectBudgetItem } from '@modules/projects/domain/entities/project-budget-item'
import type { ProjectExpense } from '@modules/projects/domain/entities/project-expense'
import type { ProjectExtension } from '@modules/projects/domain/entities/project-extension'
import type { ProjectDocument } from '@modules/projects/domain/entities/project-document'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { Page } from '@shared/types/pagination'
import type { ListQuery } from '@shared/types/filters'
import { applyFilterGroups, combineWhere } from '@shared/db/drizzle-filters'
import { budgetItemColumnMap, budgetItemSortableFields, documentColumnMap, documentSortableFields, expenseColumnMap, expenseSortableFields, extensionColumnMap, extensionSortableFields, stateChangeColumnMap, stateChangeSortableFields } from '@modules/projects/infrastructure/project.resource'

type ProjectRow = typeof projects.$inferSelect
type ProjectStateChangeRow = typeof projectStateChanges.$inferSelect
type ProjectResponsibleRow = typeof projectResponsibles.$inferSelect
type ProjectBudgetItemRow = typeof projectBudgetItems.$inferSelect
type ProjectExpenseRow = typeof projectExpenses.$inferSelect
type ProjectExtensionRow = typeof projectExtensions.$inferSelect
type ProjectDocumentRow = typeof projectDocuments.$inferSelect

function toStateChangeCause(row: ProjectStateChangeRow): StateChangeCause {
  if (row.causeKind === 'manual') {
    return { kind: 'manual', userId: row.causedByUserId ?? '' }
  }
  return { kind: 'system', reason: row.causeReason ?? '' }
}

function toProjectStateChange(row: ProjectStateChangeRow): ProjectStateChange {
  return {
    id: row.id,
    projectId: row.projectId,
    previousState: row.previousState as ProjectStatus,
    nextState: row.nextState as ProjectStatus,
    cause: toStateChangeCause(row),
    changedAt: row.changedAt,
    createdAt: row.createdAt,
  }
}

function toProjectResponsible(row: ProjectResponsibleRow, userName?: string | null): ProjectResponsible {
  return {
    id: row.id,
    projectId: row.projectId,
    userId: row.userId,
    userName: userName ?? null,
    role: row.role as ProjectResponsibleRole,
    assignedBy: row.assignedBy,
    assignedAt: row.assignedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toProjectBudgetItem(row: ProjectBudgetItemRow): ProjectBudgetItem {
  return {
    id: row.id,
    projectId: row.projectId,
    concept: row.concept,
    amountMinor: row.amountMinor,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toProjectExpense(row: ProjectExpenseRow): ProjectExpense {
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

function toProjectExtension(row: ProjectExtensionRow): ProjectExtension {
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

function toProjectDocument(row: ProjectDocumentRow): ProjectDocument {
  return {
    id: row.id,
    projectId: row.projectId,
    fileName: row.fileName,
    contentType: row.contentType,
    sizeBytes: row.sizeBytes,
    storageKey: row.storageKey,
    uploadedBy: row.uploadedBy,
    uploadedAt: row.uploadedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

type ResponsibleRowWithUser = ProjectResponsibleRow & { userName?: string | null }

function reconstitute(
  projectRow: ProjectRow,
  stateChangeRows: ProjectStateChangeRow[],
  responsibleRows: ResponsibleRowWithUser[],
  budgetItemRows: ProjectBudgetItemRow[],
  expenseRows: ProjectExpenseRow[],
  extensionRows: ProjectExtensionRow[],
  documentRows: ProjectDocumentRow[],
): Project {
  return Project.reconstitute({
    id: projectRow.id,
    name: projectRow.name,
    description: projectRow.description,
    contactId: projectRow.contactId,
    currency: projectRow.currency,
    status: projectRow.status as ProjectStatus,
    startDate: projectRow.startDate,
    originalPlannedEndDate: projectRow.originalPlannedEndDate,
    createdBy: projectRow.createdBy,
    createdAt: projectRow.createdAt,
    updatedAt: projectRow.updatedAt,
    deletedAt: projectRow.deletedAt,
    stateChanges: stateChangeRows.map(toProjectStateChange),
    responsibles: responsibleRows.map((r) => toProjectResponsible(r, r.userName)),
    budgetItems: budgetItemRows.map(toProjectBudgetItem),
    expenses: expenseRows.map(toProjectExpense),
    extensions: extensionRows.map(toProjectExtension),
    documents: documentRows.map(toProjectDocument),
  })
}

function toProjectRow(project: Project): typeof projects.$inferInsert {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    contactId: project.contactId,
    currency: project.currency,
    status: project.status,
    startDate: project.startDate,
    plannedEndDate: project.plannedEndDate,
    originalPlannedEndDate: project.originalPlannedEndDate,
    createdBy: project.createdBy,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    deletedAt: project.deletedAt,
  }
}

function toResponsibleRow(r: ProjectResponsible): typeof projectResponsibles.$inferInsert {
  return {
    id: r.id,
    projectId: r.projectId,
    userId: r.userId,
    role: r.role,
    assignedBy: r.assignedBy,
    assignedAt: r.assignedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

function toBudgetItemRow(item: ProjectBudgetItem): typeof projectBudgetItems.$inferInsert {
  return {
    id: item.id,
    projectId: item.projectId,
    concept: item.concept,
    amountMinor: item.amountMinor,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function toExpenseRow(expense: ProjectExpense): typeof projectExpenses.$inferInsert {
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

function toStateChangeRow(sc: ProjectStateChange): typeof projectStateChanges.$inferInsert {
  return {
    id: sc.id,
    projectId: sc.projectId,
    previousState: sc.previousState,
    nextState: sc.nextState,
    causeKind: sc.cause.kind,
    causedByUserId: sc.cause.kind === 'manual' ? sc.cause.userId : null,
    causeReason: sc.cause.kind === 'system' ? sc.cause.reason : null,
    changedAt: sc.changedAt,
    createdAt: sc.createdAt,
  }
}

export class DrizzleProjectsRepository implements ProjectsRepository {
  constructor(private readonly db: Db) {}

  private async updateProjectRow(
    tx: Parameters<Parameters<typeof this.db.transaction>[0]>[0],
    project: Project,
  ): Promise<void> {
    const row = toProjectRow(project)
    await tx
      .update(projects)
      .set({
        name: row.name,
        description: row.description,
        contactId: row.contactId,
        currency: row.currency,
        status: row.status,
        startDate: row.startDate,
        plannedEndDate: row.plannedEndDate,
        deletedAt: row.deletedAt,
        updatedAt: row.updatedAt,
      })
      .where(eq(projects.id, project.id))
  }

  async findById(id: string): Promise<Project | null> {
    const projectRow = await this.db.query.projects.findFirst({
      where: and(eq(projects.id, id), isNull(projects.deletedAt)),
    })

    if (!projectRow) return null

    const [stateChangeRows, responsibleWithUserRows, budgetItemRows, expenseRows, extensionRows, documentRows] = await Promise.all([
      this.db.query.projectStateChanges.findMany({
        where: eq(projectStateChanges.projectId, id),
      }),
      this.db
        .select({
          id: projectResponsibles.id,
          projectId: projectResponsibles.projectId,
          userId: projectResponsibles.userId,
          role: projectResponsibles.role,
          assignedBy: projectResponsibles.assignedBy,
          assignedAt: projectResponsibles.assignedAt,
          createdAt: projectResponsibles.createdAt,
          updatedAt: projectResponsibles.updatedAt,
          userName: users.name,
        })
        .from(projectResponsibles)
        .leftJoin(users, eq(users.id, projectResponsibles.userId))
        .where(eq(projectResponsibles.projectId, id)),
      this.db.query.projectBudgetItems.findMany({
        where: eq(projectBudgetItems.projectId, id),
      }),
      this.db.query.projectExpenses.findMany({
        where: eq(projectExpenses.projectId, id),
      }),
      this.db
        .select()
        .from(projectExtensions)
        .where(eq(projectExtensions.projectId, id))
        .orderBy(asc(projectExtensions.grantedAt), asc(projectExtensions.createdAt)),
      this.db
        .select()
        .from(projectDocuments)
        .where(eq(projectDocuments.projectId, id))
        .orderBy(desc(projectDocuments.uploadedAt), desc(projectDocuments.createdAt)),
    ])

    const responsibleRows = responsibleWithUserRows.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      userId: r.userId,
      role: r.role,
      assignedBy: r.assignedBy,
      assignedAt: r.assignedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      userName: r.userName,
    }))

    return reconstitute(projectRow, stateChangeRows, responsibleRows, budgetItemRows, expenseRows, extensionRows, documentRows)
  }

  async create(project: Project): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(projects).values(toProjectRow(project))
      if (project.responsibles.length > 0) {
        await tx.insert(projectResponsibles).values(project.responsibles.map(toResponsibleRow))
      }
    })
  }

  async updateProject(project: Project): Promise<void> {
    await this.db.transaction(async (tx) => {
      await this.updateProjectRow(tx, project)
    })
  }

  async appendStateChange(project: Project): Promise<void> {
    const newStateChanges = project.newStateChanges

    await this.db.transaction(async (tx) => {
      if (newStateChanges.length > 0) {
        await tx.insert(projectStateChanges).values(newStateChanges.map(toStateChangeRow))
      }
      await this.updateProjectRow(tx, project)
    })
  }

  async addResponsible(project: Project, responsible: ProjectResponsible): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(projectResponsibles).values(toResponsibleRow(responsible))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async updateResponsibleRole(project: Project, userId: string): Promise<void> {
    const responsible = project.responsibles.find((r) => r.userId === userId)
    if (!responsible) return

    await this.db.transaction(async (tx) => {
      await tx
        .update(projectResponsibles)
        .set({ role: responsible.role, updatedAt: responsible.updatedAt })
        .where(and(eq(projectResponsibles.projectId, project.id), eq(projectResponsibles.userId, userId)))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async removeResponsible(project: Project, userId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(projectResponsibles)
        .where(and(eq(projectResponsibles.projectId, project.id), eq(projectResponsibles.userId, userId)))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async softDeleteMany(ids: string[], deletedAt: Date): Promise<void> {
    if (ids.length === 0) return
    await this.db
      .update(projects)
      .set({ deletedAt, updatedAt: deletedAt })
      .where(and(inArray(projects.id, ids), isNull(projects.deletedAt)))
  }

  async findStateChanges(projectId: string, params: ListQuery): Promise<Page<ProjectStateChange>> {
    const projectGuard = eq(projectStateChanges.projectId, projectId)
    const filterClause = applyFilterGroups(stateChangeColumnMap, params.filterGroups)
    const where = combineWhere([projectGuard, filterClause])

    const sortableMap = stateChangeColumnMap as Record<string, AnyColumn>
    const sortCol = params.sort ? sortableMap[params.sort.field] : undefined
    const orderExpr = sortCol
      ? params.sort!.dir === 'asc'
        ? asc(sortCol)
        : desc(sortCol)
      : desc(projectStateChanges.changedAt)

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projectStateChanges)
        .where(where),
      this.db
        .select()
        .from(projectStateChanges)
        .where(where)
        .orderBy(orderExpr)
        .limit(params.pagination.limit)
        .offset(params.pagination.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items = rows.map(toProjectStateChange)

    return { items, total, limit: params.pagination.limit, offset: params.pagination.offset }
  }

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

  async addDocument(project: Project, document: ProjectDocument): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(projectDocuments).values({
        id: document.id,
        projectId: document.projectId,
        fileName: document.fileName,
        contentType: document.contentType,
        sizeBytes: document.sizeBytes,
        storageKey: document.storageKey,
        uploadedBy: document.uploadedBy,
        uploadedAt: document.uploadedAt,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      })
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async deleteDocument(project: Project, documentId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(projectDocuments).where(eq(projectDocuments.id, documentId))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async findDocumentById(id: string): Promise<ProjectDocument | null> {
    const row = await this.db.query.projectDocuments.findFirst({
      where: eq(projectDocuments.id, id),
    })
    if (!row) return null
    return toProjectDocument(row)
  }

  async findDocuments(projectId: string, params: ListQuery): Promise<Page<ProjectDocument>> {
    const projectGuard = eq(projectDocuments.projectId, projectId)
    const filterClause = applyFilterGroups(documentColumnMap, params.filterGroups)
    const where = combineWhere([projectGuard, filterClause])

    const sortableMap = documentColumnMap as Record<string, AnyColumn>
    const sortCol = params.sort ? sortableMap[params.sort.field] : undefined
    const orderExpr = sortCol
      ? params.sort!.dir === 'asc'
        ? asc(sortCol)
        : desc(sortCol)
      : desc(projectDocuments.uploadedAt)

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projectDocuments)
        .where(where),
      this.db
        .select()
        .from(projectDocuments)
        .where(where)
        .orderBy(orderExpr)
        .limit(params.pagination.limit)
        .offset(params.pagination.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items = rows.map(toProjectDocument)

    return { items, total, limit: params.pagination.limit, offset: params.pagination.offset }
  }
}
