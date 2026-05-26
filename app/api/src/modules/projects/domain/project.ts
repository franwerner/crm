import { ValidationError, BusinessRuleError, NotFoundError } from '@shared/errors'
import type { ProjectStatus } from '@modules/projects/domain/types/project-status'
import type { ProjectResponsibleRole } from '@modules/projects/domain/types/project-responsible-role'
import type { StateChangeCause } from '@modules/projects/domain/types/state-change-cause'
import type { ProjectStateChange } from '@modules/projects/domain/entities/project-state-change'
import type { ProjectResponsible } from '@modules/projects/domain/entities/project-responsible'
import type { ProjectBudgetItem } from '@modules/projects/domain/entities/project-budget-item'
import type { ProjectExpense } from '@modules/projects/domain/entities/project-expense'
import type { ProjectExtension } from '@modules/projects/domain/entities/project-extension'
import type { ProjectDocument } from '@modules/projects/domain/entities/project-document'
import { assertAllowedTransition } from '@modules/projects/domain/policies'
import { Money } from '@modules/projects/domain/value-objects/money'
import type { ProjectProfit } from '@modules/projects/domain/value-objects/project-profit'

export interface ProjectProps {
  readonly id: string
  readonly name: string
  readonly description: string | null
  readonly contactId: string
  readonly currency: string
  readonly status: ProjectStatus
  readonly startDate: Date
  readonly originalPlannedEndDate: Date
  readonly createdBy: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null
  readonly stateChanges: readonly ProjectStateChange[]
  readonly responsibles: readonly ProjectResponsible[]
  readonly budgetItems: readonly ProjectBudgetItem[]
  readonly expenses: readonly ProjectExpense[]
  readonly extensions: readonly ProjectExtension[]
  readonly documents: readonly ProjectDocument[]
}

export class Project {
  private readonly props: ProjectProps
  private readonly pendingStateChanges: ProjectStateChange[]

  private constructor(props: ProjectProps, pendingStateChanges: ProjectStateChange[]) {
    this.props = props
    this.pendingStateChanges = pendingStateChanges
  }

  static create(params: {
    id: string
    name: string
    description?: string | null
    contactId: string
    currency: string
    startDate: Date
    plannedEndDate: Date
    createdBy: string
    createdAt: Date
    updatedAt: Date
    responsibles?: readonly ProjectResponsible[]
    budgetItems?: readonly ProjectBudgetItem[]
    expenses?: readonly ProjectExpense[]
  }): Project {
    if (!params.name.trim()) {
      throw new ValidationError('Project name cannot be empty', [
        { field: 'name', message: 'Name is required' },
      ])
    }
    if (!params.id.trim()) {
      throw new ValidationError('Project id cannot be empty', [
        { field: 'id', message: 'Id is required' },
      ])
    }
    if (!params.createdBy.trim()) {
      throw new ValidationError('createdBy cannot be empty', [
        { field: 'createdBy', message: 'createdBy is required' },
      ])
    }
    if (params.currency.length !== 3 || params.currency !== params.currency.toUpperCase()) {
      throw new ValidationError('Currency must be 3 uppercase ISO 4217 characters', [
        { field: 'currency', message: 'expected 3-char uppercase ISO 4217 code' },
      ])
    }
    if (params.plannedEndDate < params.startDate) {
      throw new ValidationError('plannedEndDate must be >= startDate', [
        { field: 'plannedEndDate', message: 'must be on or after startDate' },
      ])
    }

    const props: ProjectProps = {
      id: params.id,
      name: params.name.trim(),
      description: params.description ?? null,
      contactId: params.contactId,
      currency: params.currency,
      status: 'Draft',
      startDate: params.startDate,
      originalPlannedEndDate: params.plannedEndDate,
      createdBy: params.createdBy,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
      deletedAt: null,
      stateChanges: [],
      responsibles: params.responsibles ?? [],
      budgetItems: params.budgetItems ?? [],
      expenses: params.expenses ?? [],
      extensions: [],
      documents: [],
    }

    return new Project(props, [])
  }

  static reconstitute(props: ProjectProps): Project {
    return new Project(props, [])
  }

  get id(): string { return this.props.id }
  get name(): string { return this.props.name }
  get description(): string | null { return this.props.description }
  get contactId(): string { return this.props.contactId }
  get currency(): string { return this.props.currency }
  get status(): ProjectStatus { return this.props.status }
  get startDate(): Date { return this.props.startDate }
  get originalPlannedEndDate(): Date { return this.props.originalPlannedEndDate }
  get plannedEndDate(): Date {
    const totalDays = this.props.extensions.reduce((sum, e) => sum + e.additionalDays, 0)
    const base = this.props.originalPlannedEndDate
    const result = new Date(base)
    result.setUTCDate(result.getUTCDate() + totalDays)
    return result
  }
  get createdBy(): string { return this.props.createdBy }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }
  get deletedAt(): Date | null { return this.props.deletedAt }
  get stateChanges(): readonly ProjectStateChange[] { return this.props.stateChanges }
  get responsibles(): readonly ProjectResponsible[] { return this.props.responsibles }
  get budgetItems(): readonly ProjectBudgetItem[] { return this.props.budgetItems }
  get expenses(): readonly ProjectExpense[] { return this.props.expenses }
  get extensions(): readonly ProjectExtension[] { return this.props.extensions }
  get documents(): readonly ProjectDocument[] { return this.props.documents }
  get newStateChanges(): readonly ProjectStateChange[] { return this.pendingStateChanges }

  get totalBudget(): Money {
    const moneys: Money[] = [
      ...this.props.budgetItems.map((i) => Money.of(i.amountMinor, this.props.currency)),
      ...this.props.extensions
        .filter((e) => e.billedAmount !== null)
        .map((e) => Money.of(e.billedAmount!, this.props.currency)),
    ]
    if (moneys.length === 0) return Money.of(0, this.props.currency)
    return Money.sum(moneys)
  }

  get totalExpenses(): Money {
    const moneys: Money[] = [
      ...this.props.expenses.map((e) => Money.of(e.amountMinor, this.props.currency)),
      ...this.props.extensions
        .filter((e) => e.cost !== null)
        .map((e) => Money.of(e.cost!, this.props.currency)),
    ]
    if (moneys.length === 0) return Money.of(0, this.props.currency)
    return Money.sum(moneys)
  }

  get profit(): ProjectProfit {
    const budget = this.totalBudget
    const expenses = this.totalExpenses
    return { amountMinor: budget.amountMinor - expenses.amountMinor, currency: this.props.currency }
  }

  update(
    params: {
      name?: string
      description?: string | null
      contactId?: string
      currency?: string
      startDate?: Date
      plannedEndDate?: Date
    },
    now: Date,
  ): Project {
    if (params.name !== undefined && !params.name.trim()) {
      throw new ValidationError('Project name cannot be empty', [
        { field: 'name', message: 'Name is required' },
      ])
    }
    if (params.currency !== undefined && (params.currency.length !== 3 || params.currency !== params.currency.toUpperCase())) {
      throw new ValidationError('Currency must be 3 uppercase ISO 4217 characters', [
        { field: 'currency', message: 'expected 3-char uppercase ISO 4217 code' },
      ])
    }

    const effectiveStartDate = params.startDate ?? this.props.startDate
    const effectivePlannedEndDate = params.plannedEndDate ?? this.props.originalPlannedEndDate

    if (effectivePlannedEndDate < effectiveStartDate) {
      throw new ValidationError('plannedEndDate must be >= startDate', [
        { field: 'plannedEndDate', message: 'must be on or after startDate' },
      ])
    }

    const nextProps: ProjectProps = {
      ...this.props,
      name: params.name !== undefined ? params.name.trim() : this.props.name,
      description: params.description !== undefined ? params.description : this.props.description,
      contactId: params.contactId !== undefined ? params.contactId : this.props.contactId,
      currency: params.currency !== undefined ? params.currency : this.props.currency,
      startDate: effectiveStartDate,
      originalPlannedEndDate: effectivePlannedEndDate,
      updatedAt: now,
    }

    return new Project(nextProps, [...this.pendingStateChanges])
  }

  changeState(params: {
    stateChangeId: string
    newState: ProjectStatus
    cause: StateChangeCause
    now: Date
  }): Project {
    assertAllowedTransition(this.props.status, params.newState)

    const stateChange: ProjectStateChange = {
      id: params.stateChangeId,
      projectId: this.props.id,
      previousState: this.props.status,
      nextState: params.newState,
      cause: params.cause,
      changedAt: params.now,
      createdAt: params.now,
    }

    const nextProps: ProjectProps = {
      ...this.props,
      status: params.newState,
      stateChanges: [...this.props.stateChanges, stateChange],
      updatedAt: params.now,
    }

    return new Project(nextProps, [...this.pendingStateChanges, stateChange])
  }

  addResponsible(responsible: ProjectResponsible): Project {
    const alreadyAssigned = this.props.responsibles.some((r) => r.userId === responsible.userId)
    if (alreadyAssigned) {
      throw new BusinessRuleError(`User ${responsible.userId} is already a responsible on project ${this.props.id}`)
    }

    const nextProps: ProjectProps = {
      ...this.props,
      responsibles: [...this.props.responsibles, responsible],
      updatedAt: responsible.createdAt,
    }

    return new Project(nextProps, [...this.pendingStateChanges])
  }

  updateResponsibleRole(userId: string, role: ProjectResponsibleRole, now: Date): Project {
    const existing = this.props.responsibles.find((r) => r.userId === userId)
    if (!existing) {
      throw new NotFoundError(`Responsible for user ${userId} not found on project ${this.props.id}`)
    }

    const updated = this.props.responsibles.map((r) =>
      r.userId === userId ? { ...r, role, updatedAt: now } : r,
    )

    const nextProps: ProjectProps = {
      ...this.props,
      responsibles: updated,
      updatedAt: now,
    }

    return new Project(nextProps, [...this.pendingStateChanges])
  }

  removeResponsible(userId: string, now: Date): Project {
    const exists = this.props.responsibles.some((r) => r.userId === userId)
    if (!exists) {
      throw new NotFoundError(`Responsible for user ${userId} not found on project ${this.props.id}`)
    }

    const remaining = this.props.responsibles.filter((r) => r.userId !== userId)

    if (remaining.length === 0) {
      throw new BusinessRuleError('Project must have at least one responsible')
    }

    const hasLead = remaining.some((r) => r.role === 'Lead')
    if (!hasLead) {
      throw new BusinessRuleError('Project must have at least one responsible with role Lead')
    }

    const nextProps: ProjectProps = {
      ...this.props,
      responsibles: remaining,
      updatedAt: now,
    }

    return new Project(nextProps, [...this.pendingStateChanges])
  }

  softDelete(now: Date): Project {
    if (this.props.deletedAt !== null) {
      return this
    }

    const nextProps: ProjectProps = {
      ...this.props,
      deletedAt: now,
      updatedAt: now,
    }

    return new Project(nextProps, [...this.pendingStateChanges])
  }

  addBudgetItem(item: ProjectBudgetItem): Project {
    const nextProps: ProjectProps = {
      ...this.props,
      budgetItems: [...this.props.budgetItems, item],
      updatedAt: item.createdAt,
    }
    return new Project(nextProps, [...this.pendingStateChanges])
  }

  updateBudgetItem(itemId: string, changes: { concept?: string; amountMinor?: number }, now: Date): Project {
    const existing = this.props.budgetItems.find((i) => i.id === itemId)
    if (!existing) {
      throw new NotFoundError(`Budget item ${itemId} not found on project ${this.props.id}`)
    }
    const updated = this.props.budgetItems.map((i) =>
      i.id === itemId
        ? {
            ...i,
            concept: changes.concept !== undefined ? changes.concept : i.concept,
            amountMinor: changes.amountMinor !== undefined ? changes.amountMinor : i.amountMinor,
            updatedAt: now,
          }
        : i,
    )
    const nextProps: ProjectProps = {
      ...this.props,
      budgetItems: updated,
      updatedAt: now,
    }
    return new Project(nextProps, [...this.pendingStateChanges])
  }

  removeBudgetItem(itemId: string, now: Date): Project {
    const exists = this.props.budgetItems.some((i) => i.id === itemId)
    if (!exists) {
      throw new NotFoundError(`Budget item ${itemId} not found on project ${this.props.id}`)
    }
    const nextProps: ProjectProps = {
      ...this.props,
      budgetItems: this.props.budgetItems.filter((i) => i.id !== itemId),
      updatedAt: now,
    }
    return new Project(nextProps, [...this.pendingStateChanges])
  }

  addExpense(expense: ProjectExpense): Project {
    const nextProps: ProjectProps = {
      ...this.props,
      expenses: [...this.props.expenses, expense],
      updatedAt: expense.createdAt,
    }
    return new Project(nextProps, [...this.pendingStateChanges])
  }

  updateExpense(expenseId: string, changes: { concept?: string; amountMinor?: number; incurredAt?: Date }, now: Date): Project {
    const existing = this.props.expenses.find((e) => e.id === expenseId)
    if (!existing) {
      throw new NotFoundError(`Expense ${expenseId} not found on project ${this.props.id}`)
    }
    const updated = this.props.expenses.map((e) =>
      e.id === expenseId
        ? {
            ...e,
            concept: changes.concept !== undefined ? changes.concept : e.concept,
            amountMinor: changes.amountMinor !== undefined ? changes.amountMinor : e.amountMinor,
            incurredAt: changes.incurredAt !== undefined ? changes.incurredAt : e.incurredAt,
            updatedAt: now,
          }
        : e,
    )
    const nextProps: ProjectProps = {
      ...this.props,
      expenses: updated,
      updatedAt: now,
    }
    return new Project(nextProps, [...this.pendingStateChanges])
  }

  removeExpense(expenseId: string, now: Date): Project {
    const exists = this.props.expenses.some((e) => e.id === expenseId)
    if (!exists) {
      throw new NotFoundError(`Expense ${expenseId} not found on project ${this.props.id}`)
    }
    const nextProps: ProjectProps = {
      ...this.props,
      expenses: this.props.expenses.filter((e) => e.id !== expenseId),
      updatedAt: now,
    }
    return new Project(nextProps, [...this.pendingStateChanges])
  }

  addExtension(extension: ProjectExtension): Project {
    const nextProps: ProjectProps = {
      ...this.props,
      extensions: [...this.props.extensions, extension],
      updatedAt: extension.createdAt,
    }
    return new Project(nextProps, [...this.pendingStateChanges])
  }

  updateExtension(
    extId: string,
    changes: {
      additionalDays?: number
      reason?: string
      cost?: number | null
      billedAmount?: number | null
      grantedAt?: Date
      appliedEndDate?: Date
    },
    now: Date,
  ): Project {
    const existing = this.props.extensions.find((e) => e.id === extId)
    if (!existing) {
      throw new NotFoundError(`Extension ${extId} not found on project ${this.props.id}`)
    }
    const updated = this.props.extensions.map((e) =>
      e.id === extId
        ? {
            ...e,
            additionalDays: changes.additionalDays !== undefined ? changes.additionalDays : e.additionalDays,
            reason: changes.reason !== undefined ? changes.reason : e.reason,
            cost: changes.cost !== undefined ? changes.cost : e.cost,
            billedAmount: changes.billedAmount !== undefined ? changes.billedAmount : e.billedAmount,
            grantedAt: changes.grantedAt !== undefined ? changes.grantedAt : e.grantedAt,
            appliedEndDate: changes.appliedEndDate !== undefined ? changes.appliedEndDate : e.appliedEndDate,
            updatedAt: now,
          }
        : e,
    )
    const nextProps: ProjectProps = {
      ...this.props,
      extensions: updated,
      updatedAt: now,
    }
    return new Project(nextProps, [...this.pendingStateChanges])
  }

  removeExtension(extId: string, now: Date): Project {
    const exists = this.props.extensions.some((e) => e.id === extId)
    if (!exists) {
      throw new NotFoundError(`Extension ${extId} not found on project ${this.props.id}`)
    }
    const nextProps: ProjectProps = {
      ...this.props,
      extensions: this.props.extensions.filter((e) => e.id !== extId),
      updatedAt: now,
    }
    return new Project(nextProps, [...this.pendingStateChanges])
  }

  addDocument(document: ProjectDocument): Project {
    const nextProps: ProjectProps = {
      ...this.props,
      documents: [...this.props.documents, document],
      updatedAt: document.uploadedAt,
    }
    return new Project(nextProps, [...this.pendingStateChanges])
  }

  removeDocument(documentId: string, now: Date): Project {
    const exists = this.props.documents.some((d) => d.id === documentId)
    if (!exists) {
      throw new NotFoundError(`Document ${documentId} not found on project ${this.props.id}`)
    }
    const nextProps: ProjectProps = {
      ...this.props,
      documents: this.props.documents.filter((d) => d.id !== documentId),
      updatedAt: now,
    }
    return new Project(nextProps, [...this.pendingStateChanges])
  }
}
