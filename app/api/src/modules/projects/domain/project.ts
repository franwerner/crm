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
import {
  computeTotalBudget,
  computeTotalExpenses,
  computeProfit,
} from '@modules/projects/domain/project-financials'
import {
  collectionAdd,
  collectionUpdateById,
  collectionRemoveById,
} from '@modules/projects/domain/project-collection-ops'

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

  private withProps(patch: Partial<ProjectProps>): Project {
    return new Project({ ...this.props, ...patch }, [...this.pendingStateChanges])
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
    return computeTotalBudget(this.props.currency, this.props.budgetItems, this.props.extensions)
  }

  get totalExpenses(): Money {
    return computeTotalExpenses(this.props.currency, this.props.expenses, this.props.extensions)
  }

  get profit(): ProjectProfit {
    return computeProfit(this.props.currency, this.props.budgetItems, this.props.expenses, this.props.extensions)
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

    return this.withProps({
      name: params.name !== undefined ? params.name.trim() : this.props.name,
      description: params.description !== undefined ? params.description : this.props.description,
      contactId: params.contactId !== undefined ? params.contactId : this.props.contactId,
      currency: params.currency !== undefined ? params.currency : this.props.currency,
      startDate: effectiveStartDate,
      originalPlannedEndDate: effectivePlannedEndDate,
      updatedAt: now,
    })
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

    return this.withProps({
      responsibles: [...this.props.responsibles, responsible],
      updatedAt: responsible.createdAt,
    })
  }

  updateResponsibleRole(userId: string, role: ProjectResponsibleRole, now: Date): Project {
    const existing = this.props.responsibles.find((r) => r.userId === userId)
    if (!existing) {
      throw new NotFoundError(`Responsible for user ${userId} not found on project ${this.props.id}`)
    }

    const updated = this.props.responsibles.map((r) =>
      r.userId === userId ? { ...r, role, updatedAt: now } : r,
    )

    return this.withProps({ responsibles: updated, updatedAt: now })
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

    return this.withProps({ responsibles: remaining, updatedAt: now })
  }

  softDelete(now: Date): Project {
    if (this.props.deletedAt !== null) {
      return this
    }

    return this.withProps({ deletedAt: now, updatedAt: now })
  }

  addBudgetItem(item: ProjectBudgetItem): Project {
    return this.withProps({
      budgetItems: collectionAdd(this.props.budgetItems, item),
      updatedAt: item.createdAt,
    })
  }

  updateBudgetItem(itemId: string, changes: { concept?: string; amountMinor?: number }, now: Date): Project {
    const updated = collectionUpdateById(
      this.props.budgetItems,
      itemId,
      `Budget item ${itemId} not found on project ${this.props.id}`,
      (i) => ({
        ...i,
        concept: changes.concept !== undefined ? changes.concept : i.concept,
        amountMinor: changes.amountMinor !== undefined ? changes.amountMinor : i.amountMinor,
        updatedAt: now,
      }),
    )
    return this.withProps({ budgetItems: updated, updatedAt: now })
  }

  removeBudgetItem(itemId: string, now: Date): Project {
    return this.withProps({
      budgetItems: collectionRemoveById(
        this.props.budgetItems,
        itemId,
        `Budget item ${itemId} not found on project ${this.props.id}`,
      ),
      updatedAt: now,
    })
  }

  addExpense(expense: ProjectExpense): Project {
    return this.withProps({
      expenses: collectionAdd(this.props.expenses, expense),
      updatedAt: expense.createdAt,
    })
  }

  updateExpense(expenseId: string, changes: { concept?: string; amountMinor?: number; incurredAt?: Date }, now: Date): Project {
    const updated = collectionUpdateById(
      this.props.expenses,
      expenseId,
      `Expense ${expenseId} not found on project ${this.props.id}`,
      (e) => ({
        ...e,
        concept: changes.concept !== undefined ? changes.concept : e.concept,
        amountMinor: changes.amountMinor !== undefined ? changes.amountMinor : e.amountMinor,
        incurredAt: changes.incurredAt !== undefined ? changes.incurredAt : e.incurredAt,
        updatedAt: now,
      }),
    )
    return this.withProps({ expenses: updated, updatedAt: now })
  }

  removeExpense(expenseId: string, now: Date): Project {
    return this.withProps({
      expenses: collectionRemoveById(
        this.props.expenses,
        expenseId,
        `Expense ${expenseId} not found on project ${this.props.id}`,
      ),
      updatedAt: now,
    })
  }

  addExtension(extension: ProjectExtension): Project {
    return this.withProps({
      extensions: collectionAdd(this.props.extensions, extension),
      updatedAt: extension.createdAt,
    })
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
    const updated = collectionUpdateById(
      this.props.extensions,
      extId,
      `Extension ${extId} not found on project ${this.props.id}`,
      (e) => ({
        ...e,
        additionalDays: changes.additionalDays !== undefined ? changes.additionalDays : e.additionalDays,
        reason: changes.reason !== undefined ? changes.reason : e.reason,
        cost: changes.cost !== undefined ? changes.cost : e.cost,
        billedAmount: changes.billedAmount !== undefined ? changes.billedAmount : e.billedAmount,
        grantedAt: changes.grantedAt !== undefined ? changes.grantedAt : e.grantedAt,
        appliedEndDate: changes.appliedEndDate !== undefined ? changes.appliedEndDate : e.appliedEndDate,
        updatedAt: now,
      }),
    )
    return this.withProps({ extensions: updated, updatedAt: now })
  }

  removeExtension(extId: string, now: Date): Project {
    return this.withProps({
      extensions: collectionRemoveById(
        this.props.extensions,
        extId,
        `Extension ${extId} not found on project ${this.props.id}`,
      ),
      updatedAt: now,
    })
  }

  addDocument(document: ProjectDocument): Project {
    return this.withProps({
      documents: collectionAdd(this.props.documents, document),
      updatedAt: document.uploadedAt,
    })
  }

  removeDocument(documentId: string, now: Date): Project {
    return this.withProps({
      documents: collectionRemoveById(
        this.props.documents,
        documentId,
        `Document ${documentId} not found on project ${this.props.id}`,
      ),
      updatedAt: now,
    })
  }
}
