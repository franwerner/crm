import type { Context } from 'hono'
import type { Project } from '@modules/projects/domain/project'
import type { ProjectStateChange } from '@modules/projects/domain/entities/project-state-change'
import type { ProjectBudgetItem } from '@modules/projects/domain/entities/project-budget-item'
import type { ProjectExpense } from '@modules/projects/domain/entities/project-expense'
import type { ProjectCreateUseCase } from '@modules/projects/application/use-cases/project-create.use-case'
import type { ProjectGetUseCase } from '@modules/projects/application/use-cases/project-get.use-case'
import type { ProjectListUseCase } from '@modules/projects/application/use-cases/project-list.use-case'
import type { ProjectUpdateUseCase } from '@modules/projects/application/use-cases/project-update.use-case'
import type { ProjectDeleteUseCase } from '@modules/projects/application/use-cases/project-delete.use-case'
import type { ProjectChangeStateUseCase } from '@modules/projects/application/use-cases/project-change-state.use-case'
import type { ProjectAddResponsibleUseCase } from '@modules/projects/application/use-cases/project-add-responsible.use-case'
import type { ProjectUpdateResponsibleRoleUseCase } from '@modules/projects/application/use-cases/project-update-responsible-role.use-case'
import type { ProjectRemoveResponsibleUseCase } from '@modules/projects/application/use-cases/project-remove-responsible.use-case'
import type { ProjectListStateChangesUseCase } from '@modules/projects/application/use-cases/project-list-state-changes.use-case'
import type { ProjectAddBudgetItemUseCase } from '@modules/projects/application/use-cases/project-add-budget-item.use-case'
import type { ProjectUpdateBudgetItemUseCase } from '@modules/projects/application/use-cases/project-update-budget-item.use-case'
import type { ProjectRemoveBudgetItemUseCase } from '@modules/projects/application/use-cases/project-remove-budget-item.use-case'
import type { ProjectListBudgetItemsUseCase } from '@modules/projects/application/use-cases/project-list-budget-items.use-case'
import type { ProjectAddExpenseUseCase } from '@modules/projects/application/use-cases/project-add-expense.use-case'
import type { ProjectUpdateExpenseUseCase } from '@modules/projects/application/use-cases/project-update-expense.use-case'
import type { ProjectRemoveExpenseUseCase } from '@modules/projects/application/use-cases/project-remove-expense.use-case'
import type { ProjectListExpensesUseCase } from '@modules/projects/application/use-cases/project-list-expenses.use-case'
import type { ProjectAddExtensionUseCase } from '@modules/projects/application/use-cases/project-add-extension.use-case'
import type { ProjectUpdateExtensionUseCase } from '@modules/projects/application/use-cases/project-update-extension.use-case'
import type { ProjectRemoveExtensionUseCase } from '@modules/projects/application/use-cases/project-remove-extension.use-case'
import type { ProjectListExtensionsUseCase } from '@modules/projects/application/use-cases/project-list-extensions.use-case'
import type { ProjectUploadDocumentUseCase } from '@modules/projects/application/use-cases/project-upload-document.use-case'
import type { ProjectGetDocumentDownloadUrlUseCase } from '@modules/projects/application/use-cases/project-get-document-download-url.use-case'
import type { ProjectDeleteDocumentUseCase } from '@modules/projects/application/use-cases/project-delete-document.use-case'
import type { ProjectListDocumentsUseCase } from '@modules/projects/application/use-cases/project-list-documents.use-case'
import type { CreateProjectRequest } from '@modules/projects/http/dto/in/project-create.in'
import type { UpdateProjectRequest } from '@modules/projects/http/dto/in/project-update.in'
import type { ChangeProjectStateRequest } from '@modules/projects/http/dto/in/project-change-state.in'
import type { AddResponsibleRequest, UpdateResponsibleRoleRequest } from '@modules/projects/http/dto/in/project-responsible.in'
import type { AddBudgetItemRequest, UpdateBudgetItemRequest } from '@modules/projects/http/dto/in/project-budget-item.in'
import type { AddExpenseRequest, UpdateExpenseRequest } from '@modules/projects/http/dto/in/project-expense.in'
import type { AddExtensionRequest, UpdateExtensionRequest } from '@modules/projects/http/dto/in/project-extension.in'
import type { ProjectExtension } from '@modules/projects/domain/entities/project-extension'
import type { ProjectDocument } from '@modules/projects/domain/entities/project-document'
import type { ProjectListInput, ProjectListItem } from '@modules/projects/application/project.query'
import type { ListQuery } from '@shared/types/filters'
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from '@modules/projects/domain/constants'
import { ValidationError } from '@shared/errors'

export interface ProjectUseCases {
  create: ProjectCreateUseCase
  get: ProjectGetUseCase
  list: ProjectListUseCase
  update: ProjectUpdateUseCase
  delete: ProjectDeleteUseCase
  changeState: ProjectChangeStateUseCase
  addResponsible: ProjectAddResponsibleUseCase
  updateResponsibleRole: ProjectUpdateResponsibleRoleUseCase
  removeResponsible: ProjectRemoveResponsibleUseCase
  listStateChanges: ProjectListStateChangesUseCase
  addBudgetItem: ProjectAddBudgetItemUseCase
  updateBudgetItem: ProjectUpdateBudgetItemUseCase
  removeBudgetItem: ProjectRemoveBudgetItemUseCase
  listBudgetItems: ProjectListBudgetItemsUseCase
  addExpense: ProjectAddExpenseUseCase
  updateExpense: ProjectUpdateExpenseUseCase
  removeExpense: ProjectRemoveExpenseUseCase
  listExpenses: ProjectListExpensesUseCase
  addExtension: ProjectAddExtensionUseCase
  updateExtension: ProjectUpdateExtensionUseCase
  removeExtension: ProjectRemoveExtensionUseCase
  listExtensions: ProjectListExtensionsUseCase
  uploadDocument: ProjectUploadDocumentUseCase
  getDocumentDownloadUrl: ProjectGetDocumentDownloadUrlUseCase
  deleteDocument: ProjectDeleteDocumentUseCase
  listDocuments: ProjectListDocumentsUseCase
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function toProjectView(project: Project) {
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

function toBudgetItemView(item: ProjectBudgetItem) {
  return {
    id: item.id,
    projectId: item.projectId,
    concept: item.concept,
    amountMinor: item.amountMinor,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}

function toExpenseView(expense: ProjectExpense) {
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

function toExtensionView(ext: ProjectExtension) {
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

function toDocumentView(doc: ProjectDocument) {
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

function toProjectListView(item: ProjectListItem) {
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

function toStateChangeView(sc: ProjectStateChange) {
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

export class ProjectController {
  constructor(private readonly ucs: ProjectUseCases) {}

  async createProject(c: Context): Promise<Response> {
    const body = c.req.valid('json' as never) as CreateProjectRequest
    const userId = c.get('userId') as string

    const project = await this.ucs.create.execute({
      name: body.name,
      description: body.description,
      contactId: body.contactId,
      currency: body.currency.toUpperCase(),
      startDate: new Date(body.startDate),
      plannedEndDate: new Date(body.plannedEndDate),
      createdBy: userId,
    })

    return c.json(toProjectView(project), 201)
  }

  async getProject(c: Context): Promise<Response> {
    const id = c.req.param('id') as string

    const project = await this.ucs.get.execute({ id })

    return c.json(toProjectView(project), 200)
  }

  async listProjects(c: Context): Promise<Response> {
    const query = c.req.valid('query' as never) as ProjectListInput

    const page = await this.ucs.list.execute(query)

    return c.json(
      {
        items: page.items.map(toProjectListView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }

  async updateProject(c: Context): Promise<Response> {
    const id = c.req.param('id') as string
    const body = c.req.valid('json' as never) as UpdateProjectRequest

    const project = await this.ucs.update.execute({
      id,
      name: body.name,
      description: body.description,
      contactId: body.contactId,
      currency: body.currency !== undefined ? body.currency.toUpperCase() : undefined,
      startDate: body.startDate !== undefined ? new Date(body.startDate) : undefined,
      plannedEndDate: body.plannedEndDate !== undefined ? new Date(body.plannedEndDate) : undefined,
    })

    return c.json(toProjectView(project), 200)
  }

  async deleteProject(c: Context): Promise<Response> {
    const id = c.req.param('id') as string

    await this.ucs.delete.execute({ id })

    return c.body(null, 204)
  }

  async changeState(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as ChangeProjectStateRequest
    const userId = c.get('userId') as string

    const project = await this.ucs.changeState.execute({
      projectId,
      newState: body.newState,
      userId,
    })

    return c.json(toProjectView(project), 200)
  }

  async addResponsible(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as AddResponsibleRequest
    const assignedBy = c.get('userId') as string

    const project = await this.ucs.addResponsible.execute({
      projectId,
      userId: body.userId,
      role: body.role,
      assignedBy,
    })

    return c.json(toProjectView(project), 200)
  }

  async updateResponsibleRole(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const userId = c.req.param('userId') as string
    const body = c.req.valid('json' as never) as UpdateResponsibleRoleRequest

    const project = await this.ucs.updateResponsibleRole.execute({
      projectId,
      userId,
      role: body.role,
    })

    return c.json(toProjectView(project), 200)
  }

  async removeResponsible(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const userId = c.req.param('userId') as string

    const project = await this.ucs.removeResponsible.execute({ projectId, userId })

    return c.json(toProjectView(project), 200)
  }

  async listStateChanges(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as ListQuery

    const page = await this.ucs.listStateChanges.execute({
      projectId,
      query,
    })

    return c.json(
      {
        items: page.items.map(toStateChangeView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }

  async addBudgetItem(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as AddBudgetItemRequest

    const project = await this.ucs.addBudgetItem.execute({
      projectId,
      concept: body.concept,
      amountMinor: body.amountMinor,
    })

    return c.json(toProjectView(project), 200)
  }

  async updateBudgetItem(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const itemId = c.req.param('itemId') as string
    const body = c.req.valid('json' as never) as UpdateBudgetItemRequest

    const project = await this.ucs.updateBudgetItem.execute({
      projectId,
      itemId,
      concept: body.concept,
      amountMinor: body.amountMinor,
    })

    return c.json(toProjectView(project), 200)
  }

  async removeBudgetItem(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const itemId = c.req.param('itemId') as string

    const project = await this.ucs.removeBudgetItem.execute({ projectId, itemId })

    return c.json(toProjectView(project), 200)
  }

  async listBudgetItems(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as ListQuery

    const page = await this.ucs.listBudgetItems.execute({ projectId, query })

    return c.json(
      {
        items: page.items.map(toBudgetItemView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }

  async addExpense(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as AddExpenseRequest

    const project = await this.ucs.addExpense.execute({
      projectId,
      concept: body.concept,
      amountMinor: body.amountMinor,
      incurredAt: new Date(body.incurredAt),
    })

    return c.json(toProjectView(project), 200)
  }

  async updateExpense(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const expenseId = c.req.param('expenseId') as string
    const body = c.req.valid('json' as never) as UpdateExpenseRequest

    const project = await this.ucs.updateExpense.execute({
      projectId,
      expenseId,
      concept: body.concept,
      amountMinor: body.amountMinor,
      incurredAt: body.incurredAt !== undefined ? new Date(body.incurredAt) : undefined,
    })

    return c.json(toProjectView(project), 200)
  }

  async removeExpense(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const expenseId = c.req.param('expenseId') as string

    const project = await this.ucs.removeExpense.execute({ projectId, expenseId })

    return c.json(toProjectView(project), 200)
  }

  async listExpenses(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as ListQuery

    const page = await this.ucs.listExpenses.execute({ projectId, query })

    return c.json(
      {
        items: page.items.map(toExpenseView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }

  async addExtension(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as AddExtensionRequest
    const grantedBy = c.get('userId') as string

    const project = await this.ucs.addExtension.execute({
      projectId,
      additionalDays: body.additionalDays,
      reason: body.reason,
      cost: body.cost,
      billedAmount: body.billedAmount,
      grantedAt: new Date(body.grantedAt),
      grantedBy,
    })

    return c.json(toProjectView(project), 200)
  }

  async updateExtension(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const extId = c.req.param('extId') as string
    const body = c.req.valid('json' as never) as UpdateExtensionRequest

    const project = await this.ucs.updateExtension.execute({
      projectId,
      extId,
      additionalDays: body.additionalDays,
      reason: body.reason,
      cost: body.cost,
      billedAmount: body.billedAmount,
      grantedAt: body.grantedAt !== undefined ? new Date(body.grantedAt) : undefined,
    })

    return c.json(toProjectView(project), 200)
  }

  async removeExtension(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const extId = c.req.param('extId') as string

    const project = await this.ucs.removeExtension.execute({ projectId, extId })

    return c.json(toProjectView(project), 200)
  }

  async listExtensions(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as ListQuery

    const page = await this.ucs.listExtensions.execute({ projectId, query })

    return c.json(
      {
        items: page.items.map(toExtensionView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }

  async uploadDocument(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const uploadedBy = c.get('userId') as string

    const body = await c.req.parseBody()
    const file = body['file']

    if (!(file instanceof File)) {
      throw new ValidationError('Missing or invalid file field', [
        { field: 'file', message: 'expected a file upload in the "file" field' },
      ])
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError('File size is invalid', [
        { field: 'file', message: `size must be between 1 and ${MAX_FILE_SIZE_BYTES} bytes` },
      ])
    }

    const allowedTypes: readonly string[] = ALLOWED_MIME_TYPES
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError('File type is not allowed', [
        { field: 'file', message: `allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` },
      ])
    }

    const document = await this.ucs.uploadDocument.execute({
      projectId,
      fileName: file.name,
      contentType: file.type,
      size: file.size,
      body: file,
      uploadedBy,
    })

    return c.json(toDocumentView(document), 201)
  }

  async listDocuments(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as ListQuery

    const page = await this.ucs.listDocuments.execute({ projectId, query })

    return c.json(
      {
        items: page.items.map(toDocumentView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }

  async getDocumentDownloadUrl(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const documentId = c.req.param('docId') as string

    const result = await this.ucs.getDocumentDownloadUrl.execute({ projectId, documentId })

    return c.json({ url: result.url, expiresAt: result.expiresAt.toISOString() }, 200)
  }

  async deleteDocument(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const documentId = c.req.param('docId') as string

    await this.ucs.deleteDocument.execute({ projectId, documentId })

    return c.body(null, 204)
  }
}
