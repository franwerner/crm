import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { AddExpenseBodySchema, UpdateExpenseBodySchema } from '@modules/projects/http/dto/in/project-expense.in'
import { ProjectViewSchema } from '@modules/projects/http/dto/out/project.out'
import { ProjectExpenseListResponseSchema } from '@modules/projects/http/dto/out/project-expense-list.out'
import { expenseListQuerySchema } from '@modules/projects/infrastructure/project.resource'
import type { ProjectController } from '@modules/projects/http/project.controller'

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

export function registerExpenseRoutes(router: OpenAPIHono, controller: ProjectController): void {
  router.openapi(addExpenseRoute, (c) => controller.addExpense(c) as never)
  router.openapi(updateExpenseRoute, (c) => controller.updateExpense(c) as never)
  router.openapi(removeExpenseRoute, (c) => controller.removeExpense(c) as never)
  router.openapi(listExpensesRoute, (c) => controller.listExpenses(c) as never)
}
