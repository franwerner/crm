import type { Context } from 'hono'
import type { ProjectCreateUseCase } from '@modules/projects/application/use-cases/project/project-create.use-case'
import type { ProjectGetUseCase } from '@modules/projects/application/use-cases/project/project-get.use-case'
import type { ProjectListUseCase } from '@modules/projects/application/use-cases/project/project-list.use-case'
import type { ProjectUpdateUseCase } from '@modules/projects/application/use-cases/project/project-update.use-case'
import type { ProjectDeleteUseCase } from '@modules/projects/application/use-cases/project/project-delete.use-case'
import type { ProjectChangeStateUseCase } from '@modules/projects/application/use-cases/project/project-change-state.use-case'
import type { ProjectAddResponsibleUseCase } from '@modules/projects/application/use-cases/responsible/project-add-responsible.use-case'
import type { ProjectUpdateResponsibleRoleUseCase } from '@modules/projects/application/use-cases/responsible/project-update-responsible-role.use-case'
import type { ProjectRemoveResponsibleUseCase } from '@modules/projects/application/use-cases/responsible/project-remove-responsible.use-case'
import type { ProjectListStateChangesUseCase } from '@modules/projects/application/use-cases/state-change/project-list-state-changes.use-case'
import type { ProjectAddBudgetItemUseCase } from '@modules/projects/application/use-cases/budget/project-add-budget-item.use-case'
import type { ProjectUpdateBudgetItemUseCase } from '@modules/projects/application/use-cases/budget/project-update-budget-item.use-case'
import type { ProjectRemoveBudgetItemUseCase } from '@modules/projects/application/use-cases/budget/project-remove-budget-item.use-case'
import type { ProjectListBudgetItemsUseCase } from '@modules/projects/application/use-cases/budget/project-list-budget-items.use-case'
import type { ProjectAddExpenseUseCase } from '@modules/projects/application/use-cases/expense/project-add-expense.use-case'
import type { ProjectUpdateExpenseUseCase } from '@modules/projects/application/use-cases/expense/project-update-expense.use-case'
import type { ProjectRemoveExpenseUseCase } from '@modules/projects/application/use-cases/expense/project-remove-expense.use-case'
import type { ProjectListExpensesUseCase } from '@modules/projects/application/use-cases/expense/project-list-expenses.use-case'
import type { ProjectAddExtensionUseCase } from '@modules/projects/application/use-cases/extension/project-add-extension.use-case'
import type { ProjectUpdateExtensionUseCase } from '@modules/projects/application/use-cases/extension/project-update-extension.use-case'
import type { ProjectRemoveExtensionUseCase } from '@modules/projects/application/use-cases/extension/project-remove-extension.use-case'
import type { ProjectListExtensionsUseCase } from '@modules/projects/application/use-cases/extension/project-list-extensions.use-case'
import type { ProjectUploadDocumentUseCase } from '@modules/projects/application/use-cases/document/project-upload-document.use-case'
import type { ProjectGetDocumentDownloadUrlUseCase } from '@modules/projects/application/use-cases/document/project-get-document-download-url.use-case'
import type { ProjectDeleteDocumentUseCase } from '@modules/projects/application/use-cases/document/project-delete-document.use-case'
import type { ProjectListDocumentsUseCase } from '@modules/projects/application/use-cases/document/project-list-documents.use-case'
import { ProjectCoreController } from './controllers/project-core.controller'
import { ProjectStateChangeController } from './controllers/project-state-change.controller'
import { ProjectResponsibleController } from './controllers/project-responsible.controller'
import { ProjectBudgetController } from './controllers/project-budget.controller'
import { ProjectExpenseController } from './controllers/project-expense.controller'
import { ProjectExtensionController } from './controllers/project-extension.controller'
import { ProjectDocumentController } from './controllers/project-document.controller'

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

export class ProjectController {
  private readonly core: ProjectCoreController
  private readonly stateChange: ProjectStateChangeController
  private readonly responsible: ProjectResponsibleController
  private readonly budget: ProjectBudgetController
  private readonly expense: ProjectExpenseController
  private readonly extension: ProjectExtensionController
  private readonly document: ProjectDocumentController

  constructor(ucs: ProjectUseCases) {
    this.core = new ProjectCoreController(ucs)
    this.stateChange = new ProjectStateChangeController(ucs)
    this.responsible = new ProjectResponsibleController(ucs)
    this.budget = new ProjectBudgetController(ucs)
    this.expense = new ProjectExpenseController(ucs)
    this.extension = new ProjectExtensionController(ucs)
    this.document = new ProjectDocumentController(ucs)
  }

  async createProject(c: Context): Promise<Response> {
    return this.core.createProject(c)
  }

  async getProject(c: Context): Promise<Response> {
    return this.core.getProject(c)
  }

  async listProjects(c: Context): Promise<Response> {
    return this.core.listProjects(c)
  }

  async updateProject(c: Context): Promise<Response> {
    return this.core.updateProject(c)
  }

  async deleteProject(c: Context): Promise<Response> {
    return this.core.deleteProject(c)
  }

  async changeState(c: Context): Promise<Response> {
    return this.stateChange.changeState(c)
  }

  async addResponsible(c: Context): Promise<Response> {
    return this.responsible.addResponsible(c)
  }

  async updateResponsibleRole(c: Context): Promise<Response> {
    return this.responsible.updateResponsibleRole(c)
  }

  async removeResponsible(c: Context): Promise<Response> {
    return this.responsible.removeResponsible(c)
  }

  async listStateChanges(c: Context): Promise<Response> {
    return this.stateChange.listStateChanges(c)
  }

  async addBudgetItem(c: Context): Promise<Response> {
    return this.budget.addBudgetItem(c)
  }

  async updateBudgetItem(c: Context): Promise<Response> {
    return this.budget.updateBudgetItem(c)
  }

  async removeBudgetItem(c: Context): Promise<Response> {
    return this.budget.removeBudgetItem(c)
  }

  async listBudgetItems(c: Context): Promise<Response> {
    return this.budget.listBudgetItems(c)
  }

  async addExpense(c: Context): Promise<Response> {
    return this.expense.addExpense(c)
  }

  async updateExpense(c: Context): Promise<Response> {
    return this.expense.updateExpense(c)
  }

  async removeExpense(c: Context): Promise<Response> {
    return this.expense.removeExpense(c)
  }

  async listExpenses(c: Context): Promise<Response> {
    return this.expense.listExpenses(c)
  }

  async addExtension(c: Context): Promise<Response> {
    return this.extension.addExtension(c)
  }

  async updateExtension(c: Context): Promise<Response> {
    return this.extension.updateExtension(c)
  }

  async removeExtension(c: Context): Promise<Response> {
    return this.extension.removeExtension(c)
  }

  async listExtensions(c: Context): Promise<Response> {
    return this.extension.listExtensions(c)
  }

  async uploadDocument(c: Context): Promise<Response> {
    return this.document.uploadDocument(c)
  }

  async listDocuments(c: Context): Promise<Response> {
    return this.document.listDocuments(c)
  }

  async getDocumentDownloadUrl(c: Context): Promise<Response> {
    return this.document.getDocumentDownloadUrl(c)
  }

  async deleteDocument(c: Context): Promise<Response> {
    return this.document.deleteDocument(c)
  }
}
