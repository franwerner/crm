import type { OpenAPIHono } from '@hono/zod-openapi'
import type { Db } from '@shared/db/client'
import type { ObjectStorage } from '@shared/storage'
import { DrizzleProjectsRepository } from '@modules/projects/infrastructure/project.repository.bun'
import { DrizzleProjectQueries } from '@modules/projects/infrastructure/project.query.drizzle'
import { ProjectCreateUseCase } from '@modules/projects/application/use-cases/project/project-create.use-case'
import { ProjectGetUseCase } from '@modules/projects/application/use-cases/project/project-get.use-case'
import { ProjectListUseCase } from '@modules/projects/application/use-cases/project/project-list.use-case'
import { ProjectUpdateUseCase } from '@modules/projects/application/use-cases/project/project-update.use-case'
import { ProjectDeleteUseCase } from '@modules/projects/application/use-cases/project/project-delete.use-case'
import { ProjectChangeStateUseCase } from '@modules/projects/application/use-cases/project/project-change-state.use-case'
import { ProjectAddResponsibleUseCase } from '@modules/projects/application/use-cases/responsible/project-add-responsible.use-case'
import { ProjectUpdateResponsibleRoleUseCase } from '@modules/projects/application/use-cases/responsible/project-update-responsible-role.use-case'
import { ProjectRemoveResponsibleUseCase } from '@modules/projects/application/use-cases/responsible/project-remove-responsible.use-case'
import { ProjectListStateChangesUseCase } from '@modules/projects/application/use-cases/state-change/project-list-state-changes.use-case'
import { ProjectAddBudgetItemUseCase } from '@modules/projects/application/use-cases/budget/project-add-budget-item.use-case'
import { ProjectUpdateBudgetItemUseCase } from '@modules/projects/application/use-cases/budget/project-update-budget-item.use-case'
import { ProjectRemoveBudgetItemUseCase } from '@modules/projects/application/use-cases/budget/project-remove-budget-item.use-case'
import { ProjectListBudgetItemsUseCase } from '@modules/projects/application/use-cases/budget/project-list-budget-items.use-case'
import { ProjectAddExpenseUseCase } from '@modules/projects/application/use-cases/expense/project-add-expense.use-case'
import { ProjectUpdateExpenseUseCase } from '@modules/projects/application/use-cases/expense/project-update-expense.use-case'
import { ProjectRemoveExpenseUseCase } from '@modules/projects/application/use-cases/expense/project-remove-expense.use-case'
import { ProjectListExpensesUseCase } from '@modules/projects/application/use-cases/expense/project-list-expenses.use-case'
import { ProjectAddExtensionUseCase } from '@modules/projects/application/use-cases/extension/project-add-extension.use-case'
import { ProjectUpdateExtensionUseCase } from '@modules/projects/application/use-cases/extension/project-update-extension.use-case'
import { ProjectRemoveExtensionUseCase } from '@modules/projects/application/use-cases/extension/project-remove-extension.use-case'
import { ProjectListExtensionsUseCase } from '@modules/projects/application/use-cases/extension/project-list-extensions.use-case'
import { ProjectUploadDocumentUseCase } from '@modules/projects/application/use-cases/document/project-upload-document.use-case'
import { ProjectGetDocumentDownloadUrlUseCase } from '@modules/projects/application/use-cases/document/project-get-document-download-url.use-case'
import { ProjectDeleteDocumentUseCase } from '@modules/projects/application/use-cases/document/project-delete-document.use-case'
import { ProjectListDocumentsUseCase } from '@modules/projects/application/use-cases/document/project-list-documents.use-case'
import { ProjectController } from '@modules/projects/http/project.controller'
import { createProjectsRouter } from '@modules/projects/http/project.routes'

export interface ProjectsModule {
  router: OpenAPIHono
}

export function bootstrapProjects(db: Db, storage: ObjectStorage): ProjectsModule {
  const repo = new DrizzleProjectsRepository(db)
  const queries = new DrizzleProjectQueries(db)

  const controller = new ProjectController({
    create: new ProjectCreateUseCase(repo),
    get: new ProjectGetUseCase(repo),
    list: new ProjectListUseCase(queries),
    update: new ProjectUpdateUseCase(repo),
    delete: new ProjectDeleteUseCase(repo),
    changeState: new ProjectChangeStateUseCase(repo),
    addResponsible: new ProjectAddResponsibleUseCase(repo),
    updateResponsibleRole: new ProjectUpdateResponsibleRoleUseCase(repo),
    removeResponsible: new ProjectRemoveResponsibleUseCase(repo),
    listStateChanges: new ProjectListStateChangesUseCase(repo),
    addBudgetItem: new ProjectAddBudgetItemUseCase(repo),
    updateBudgetItem: new ProjectUpdateBudgetItemUseCase(repo),
    removeBudgetItem: new ProjectRemoveBudgetItemUseCase(repo),
    listBudgetItems: new ProjectListBudgetItemsUseCase(repo),
    addExpense: new ProjectAddExpenseUseCase(repo),
    updateExpense: new ProjectUpdateExpenseUseCase(repo),
    removeExpense: new ProjectRemoveExpenseUseCase(repo),
    listExpenses: new ProjectListExpensesUseCase(repo),
    addExtension: new ProjectAddExtensionUseCase(repo),
    updateExtension: new ProjectUpdateExtensionUseCase(repo),
    removeExtension: new ProjectRemoveExtensionUseCase(repo),
    listExtensions: new ProjectListExtensionsUseCase(repo),
    uploadDocument: new ProjectUploadDocumentUseCase(repo, storage),
    getDocumentDownloadUrl: new ProjectGetDocumentDownloadUrlUseCase(repo, storage),
    deleteDocument: new ProjectDeleteDocumentUseCase(repo, storage),
    listDocuments: new ProjectListDocumentsUseCase(repo),
  })

  return {
    router: createProjectsRouter(controller),
  }
}
