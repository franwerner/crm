import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { authMiddleware } from '@shared/http/auth-middleware'
import { bracketedQueryMiddleware } from '@shared/http/bracketed-query'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { CreateProjectBodySchema } from '@modules/projects/http/dto/in/project-create.in'
import { UpdateProjectBodySchema } from '@modules/projects/http/dto/in/project-update.in'
import { ChangeProjectStateBodySchema } from '@modules/projects/http/dto/in/project-change-state.in'
import { AddResponsibleBodySchema, UpdateResponsibleRoleBodySchema } from '@modules/projects/http/dto/in/project-responsible.in'
import { AddBudgetItemBodySchema, UpdateBudgetItemBodySchema } from '@modules/projects/http/dto/in/project-budget-item.in'
import { AddExpenseBodySchema, UpdateExpenseBodySchema } from '@modules/projects/http/dto/in/project-expense.in'
import { AddExtensionBodySchema, UpdateExtensionBodySchema } from '@modules/projects/http/dto/in/project-extension.in'
import { ProjectViewSchema } from '@modules/projects/http/dto/out/project.out'
import { ProjectListResponseSchema } from '@modules/projects/http/dto/out/project-list.out'
import { ProjectStateChangeListResponseSchema } from '@modules/projects/http/dto/out/project-state-change-list.out'
import { ProjectBudgetItemListResponseSchema } from '@modules/projects/http/dto/out/project-budget-item-list.out'
import { ProjectExpenseListResponseSchema } from '@modules/projects/http/dto/out/project-expense-list.out'
import { ProjectExtensionListResponseSchema } from '@modules/projects/http/dto/out/project-extension-list.out'
import { projectListQuerySchema, budgetItemListQuerySchema, expenseListQuerySchema, extensionListQuerySchema, documentListQuerySchema, stateChangeListQuerySchema } from '@modules/projects/infrastructure/project.resource'
import { ProjectDocumentViewSchema } from '@modules/projects/http/dto/out/project-document.out'
import { ProjectDocumentListResponseSchema } from '@modules/projects/http/dto/out/project-document-list.out'
import { ProjectDocumentDownloadUrlSchema } from '@modules/projects/http/dto/out/project-document-download-url.out'
import type { ProjectController } from '@modules/projects/http/project.controller'

const createProjectRoute = createRoute({
  method: 'post',
  path: '/projects',
  summary: 'Create a project',
  tags: ['projects'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: CreateProjectBodySchema } },
    },
  },
  responses: {
    201: {
      description: 'Project created.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const getProjectRoute = createRoute({
  method: 'get',
  path: '/projects/{id}',
  summary: 'Get a project by id',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: 'Project found.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const updateProjectRoute = createRoute({
  method: 'patch',
  path: '/projects/{id}',
  summary: 'Update a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateProjectBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Project updated.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const deleteProjectRoute = createRoute({
  method: 'delete',
  path: '/projects/{id}',
  summary: 'Soft-delete a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: { description: 'Project deleted.' },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const changeStateRoute = createRoute({
  method: 'post',
  path: '/projects/{id}/state',
  summary: 'Change project state',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: ChangeProjectStateBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'State changed. Returns updated project.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    422: {
      description: 'Transition not allowed.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const addResponsibleRoute = createRoute({
  method: 'post',
  path: '/projects/{id}/responsibles',
  summary: 'Add a responsible to a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: AddResponsibleBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Responsible added. Returns updated project.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const updateResponsibleRoleRoute = createRoute({
  method: 'patch',
  path: '/projects/{id}/responsibles/{userId}',
  summary: 'Update the role of a responsible',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string(), userId: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateResponsibleRoleBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Role updated. Returns updated project.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project or responsible not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const removeResponsibleRoute = createRoute({
  method: 'delete',
  path: '/projects/{id}/responsibles/{userId}',
  summary: 'Remove a responsible from a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string(), userId: z.string() }),
  },
  responses: {
    200: {
      description: 'Responsible removed. Returns updated project.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project or responsible not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    422: {
      description: 'Cannot remove last responsible or last Lead.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const listStateChangesRoute = createRoute({
  method: 'get',
  path: '/projects/{id}/state-changes',
  summary: 'List state changes for a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string() }),
    query: stateChangeListQuerySchema,
  },
  responses: {
    200: {
      description: 'Paginated list of state changes.',
      content: { 'application/json': { schema: ProjectStateChangeListResponseSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const addBudgetItemRoute = createRoute({
  method: 'post',
  path: '/projects/{id}/budget-items',
  summary: 'Add a budget item to a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: AddBudgetItemBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Budget item added. Returns updated project.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const updateBudgetItemRoute = createRoute({
  method: 'patch',
  path: '/projects/{id}/budget-items/{itemId}',
  summary: 'Update a budget item',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string(), itemId: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateBudgetItemBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Budget item updated. Returns updated project.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project or budget item not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const removeBudgetItemRoute = createRoute({
  method: 'delete',
  path: '/projects/{id}/budget-items/{itemId}',
  summary: 'Remove a budget item from a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string(), itemId: z.string() }),
  },
  responses: {
    200: {
      description: 'Budget item removed. Returns updated project.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project or budget item not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const addExpenseRoute = createRoute({
  method: 'post',
  path: '/projects/{id}/expenses',
  summary: 'Add an expense to a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: AddExpenseBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Expense added. Returns updated project.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const updateExpenseRoute = createRoute({
  method: 'patch',
  path: '/projects/{id}/expenses/{expenseId}',
  summary: 'Update an expense',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string(), expenseId: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateExpenseBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Expense updated. Returns updated project.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project or expense not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const removeExpenseRoute = createRoute({
  method: 'delete',
  path: '/projects/{id}/expenses/{expenseId}',
  summary: 'Remove an expense from a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string(), expenseId: z.string() }),
  },
  responses: {
    200: {
      description: 'Expense removed. Returns updated project.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project or expense not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const addExtensionRoute = createRoute({
  method: 'post',
  path: '/projects/{id}/extensions',
  summary: 'Add an extension to a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: AddExtensionBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Extension added. Returns updated project.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const updateExtensionRoute = createRoute({
  method: 'patch',
  path: '/projects/{id}/extensions/{extId}',
  summary: 'Update an extension',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string(), extId: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateExtensionBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Extension updated. Returns updated project.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project or extension not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const removeExtensionRoute = createRoute({
  method: 'delete',
  path: '/projects/{id}/extensions/{extId}',
  summary: 'Remove an extension from a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string(), extId: z.string() }),
  },
  responses: {
    200: {
      description: 'Extension removed. Returns updated project.',
      content: { 'application/json': { schema: ProjectViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project or extension not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const uploadDocumentRoute = createRoute({
  method: 'post',
  path: '/projects/{id}/documents',
  summary: 'Upload a document to a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    201: {
      description: 'Document uploaded.',
      content: { 'application/json': { schema: ProjectDocumentViewSchema } },
    },
    400: {
      description: 'Invalid file.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const getDocumentDownloadUrlRoute = createRoute({
  method: 'get',
  path: '/projects/{id}/documents/{docId}/download-url',
  summary: 'Get a presigned download URL for a document',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string(), docId: z.string() }),
  },
  responses: {
    200: {
      description: 'Presigned download URL.',
      content: { 'application/json': { schema: ProjectDocumentDownloadUrlSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project or document not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const deleteDocumentRoute = createRoute({
  method: 'delete',
  path: '/projects/{id}/documents/{docId}',
  summary: 'Delete a document from a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string(), docId: z.string() }),
  },
  responses: {
    204: { description: 'Document deleted.' },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project or document not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

export function createProjectsRouter(controller: ProjectController): OpenAPIHono {
  const router = new OpenAPIHono()

  router.use('*', bracketedQueryMiddleware)
  router.use('*', authMiddleware)

  const listProjectsRoute = createRoute({
    method: 'get',
    path: '/projects',
    summary: 'List projects',
    tags: ['projects'],
    request: {
      query: projectListQuerySchema,
    },
    responses: {
      200: {
        description: 'Paginated list of projects.',
        content: { 'application/json': { schema: ProjectListResponseSchema } },
      },
      401: {
        description: 'Unauthorized.',
        content: { 'application/problem+json': { schema: ProblemSchema } },
      },
    },
  })

  const listBudgetItemsRoute = createRoute({
    method: 'get',
    path: '/projects/{id}/budget-items',
    summary: 'List budget items for a project',
    tags: ['projects'],
    request: {
      params: z.object({ id: z.string() }),
      query: budgetItemListQuerySchema,
    },
    responses: {
      200: {
        description: 'Paginated list of budget items.',
        content: { 'application/json': { schema: ProjectBudgetItemListResponseSchema } },
      },
      401: {
        description: 'Unauthorized.',
        content: { 'application/problem+json': { schema: ProblemSchema } },
      },
      404: {
        description: 'Project not found.',
        content: { 'application/problem+json': { schema: ProblemSchema } },
      },
    },
  })

  const listExpensesRoute = createRoute({
    method: 'get',
    path: '/projects/{id}/expenses',
    summary: 'List expenses for a project',
    tags: ['projects'],
    request: {
      params: z.object({ id: z.string() }),
      query: expenseListQuerySchema,
    },
    responses: {
      200: {
        description: 'Paginated list of expenses.',
        content: { 'application/json': { schema: ProjectExpenseListResponseSchema } },
      },
      401: {
        description: 'Unauthorized.',
        content: { 'application/problem+json': { schema: ProblemSchema } },
      },
      404: {
        description: 'Project not found.',
        content: { 'application/problem+json': { schema: ProblemSchema } },
      },
    },
  })

  const listExtensionsRoute = createRoute({
    method: 'get',
    path: '/projects/{id}/extensions',
    summary: 'List extensions for a project',
    tags: ['projects'],
    request: {
      params: z.object({ id: z.string() }),
      query: extensionListQuerySchema,
    },
    responses: {
      200: {
        description: 'Paginated list of extensions.',
        content: { 'application/json': { schema: ProjectExtensionListResponseSchema } },
      },
      401: {
        description: 'Unauthorized.',
        content: { 'application/problem+json': { schema: ProblemSchema } },
      },
      404: {
        description: 'Project not found.',
        content: { 'application/problem+json': { schema: ProblemSchema } },
      },
    },
  })

  const listDocumentsRoute = createRoute({
    method: 'get',
    path: '/projects/{id}/documents',
    summary: 'List documents for a project',
    tags: ['projects'],
    request: {
      params: z.object({ id: z.string() }),
      query: documentListQuerySchema,
    },
    responses: {
      200: {
        description: 'Paginated list of documents.',
        content: { 'application/json': { schema: ProjectDocumentListResponseSchema } },
      },
      401: {
        description: 'Unauthorized.',
        content: { 'application/problem+json': { schema: ProblemSchema } },
      },
      404: {
        description: 'Project not found.',
        content: { 'application/problem+json': { schema: ProblemSchema } },
      },
    },
  })

  router.openapi(createProjectRoute, (c) => controller.createProject(c) as never)
  router.openapi(listProjectsRoute, (c) => controller.listProjects(c) as never)
  router.openapi(getProjectRoute, (c) => controller.getProject(c) as never)
  router.openapi(updateProjectRoute, (c) => controller.updateProject(c) as never)
  router.openapi(deleteProjectRoute, (c) => controller.deleteProject(c) as never)
  router.openapi(changeStateRoute, (c) => controller.changeState(c) as never)
  router.openapi(addResponsibleRoute, (c) => controller.addResponsible(c) as never)
  router.openapi(updateResponsibleRoleRoute, (c) => controller.updateResponsibleRole(c) as never)
  router.openapi(removeResponsibleRoute, (c) => controller.removeResponsible(c) as never)
  router.openapi(listStateChangesRoute, (c) => controller.listStateChanges(c) as never)
  router.openapi(addBudgetItemRoute, (c) => controller.addBudgetItem(c) as never)
  router.openapi(updateBudgetItemRoute, (c) => controller.updateBudgetItem(c) as never)
  router.openapi(removeBudgetItemRoute, (c) => controller.removeBudgetItem(c) as never)
  router.openapi(listBudgetItemsRoute, (c) => controller.listBudgetItems(c) as never)
  router.openapi(addExpenseRoute, (c) => controller.addExpense(c) as never)
  router.openapi(updateExpenseRoute, (c) => controller.updateExpense(c) as never)
  router.openapi(removeExpenseRoute, (c) => controller.removeExpense(c) as never)
  router.openapi(listExpensesRoute, (c) => controller.listExpenses(c) as never)
  router.openapi(addExtensionRoute, (c) => controller.addExtension(c) as never)
  router.openapi(updateExtensionRoute, (c) => controller.updateExtension(c) as never)
  router.openapi(removeExtensionRoute, (c) => controller.removeExtension(c) as never)
  router.openapi(listExtensionsRoute, (c) => controller.listExtensions(c) as never)
  router.openapi(uploadDocumentRoute, (c) => controller.uploadDocument(c) as never)
  router.openapi(listDocumentsRoute, (c) => controller.listDocuments(c) as never)
  router.openapi(getDocumentDownloadUrlRoute, (c) => controller.getDocumentDownloadUrl(c) as never)
  router.openapi(deleteDocumentRoute, (c) => controller.deleteDocument(c) as never)

  return router
}
