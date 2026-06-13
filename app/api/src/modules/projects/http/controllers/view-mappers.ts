import type { Project } from '@modules/projects/domain/project'
import type { ProjectStateChange } from '@modules/projects/domain/entities/project-state-change'
import type { ProjectBudgetItem } from '@modules/projects/domain/entities/project-budget-item'
import type { ProjectExpense } from '@modules/projects/domain/entities/project-expense'
import type { ProjectExtension } from '@modules/projects/domain/entities/project-extension'
import type { ProjectDocument } from '@modules/projects/domain/entities/project-document'
import type { ProjectListItem } from '@modules/projects/application/project.query'

export function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function toProjectView(project: Project) {
  const budget = project.totalBudget
  const expenses = project.totalExpenses
  const profit = project.profit
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    contactId: project.contactId,
    currency: project.currency,
    status: project.status,
    startDate: toDateString(project.startDate),
    originalPlannedEndDate: toDateString(project.originalPlannedEndDate),
    plannedEndDate: toDateString(project.plannedEndDate),
    createdBy: project.createdBy,
    responsibles: project.responsibles.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.userName,
      role: r.role,
      assignedBy: r.assignedBy,
      assignedAt: r.assignedAt.toISOString(),
    })),
    totals: {
      budget: { amountMinor: budget.amountMinor, currency: budget.currency },
      expenses: { amountMinor: expenses.amountMinor, currency: expenses.currency },
      profit: { amountMinor: profit.amountMinor, currency: profit.currency },
    },
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }
}

export function toBudgetItemView(item: ProjectBudgetItem) {
  return {
    id: item.id,
    projectId: item.projectId,
    concept: item.concept,
    amountMinor: item.amountMinor,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}

export function toExpenseView(expense: ProjectExpense) {
  return {
    id: expense.id,
    projectId: expense.projectId,
    concept: expense.concept,
    amountMinor: expense.amountMinor,
    incurredAt: toDateString(expense.incurredAt),
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  }
}

export function toExtensionView(ext: ProjectExtension) {
  return {
    id: ext.id,
    projectId: ext.projectId,
    additionalDays: ext.additionalDays,
    appliedEndDate: toDateString(ext.appliedEndDate),
    reason: ext.reason,
    cost: ext.cost,
    billedAmount: ext.billedAmount,
    grantedAt: toDateString(ext.grantedAt),
    grantedBy: ext.grantedBy,
    createdAt: ext.createdAt.toISOString(),
    updatedAt: ext.updatedAt.toISOString(),
  }
}

export function toDocumentView(doc: ProjectDocument) {
  return {
    id: doc.id,
    projectId: doc.projectId,
    fileName: doc.fileName,
    contentType: doc.contentType,
    sizeBytes: doc.sizeBytes,
    uploadedBy: doc.uploadedBy,
    uploadedAt: doc.uploadedAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

export function toProjectListView(item: ProjectListItem) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    contactId: item.contactId,
    contactName: item.contactName,
    currency: item.currency,
    status: item.status,
    startDate: toDateString(item.startDate),
    plannedEndDate: toDateString(item.plannedEndDate),
    createdBy: item.createdBy,
    responsiblesCount: item.responsiblesCount,
    leads: item.leads,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}

export function toStateChangeView(sc: ProjectStateChange) {
  return {
    id: sc.id,
    projectId: sc.projectId,
    previousState: sc.previousState,
    nextState: sc.nextState,
    causeKind: sc.cause.kind,
    causedByUserId: sc.cause.kind === 'manual' ? sc.cause.userId : null,
    changedAt: sc.changedAt.toISOString(),
    createdAt: sc.createdAt.toISOString(),
  }
}
