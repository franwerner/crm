import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { AddBudgetItemBodySchema, UpdateBudgetItemBodySchema } from '@modules/projects/http/dto/in/project-budget-item.in'
import { ProjectViewSchema } from '@modules/projects/http/dto/out/project.out'
import { ProjectBudgetItemListResponseSchema } from '@modules/projects/http/dto/out/project-budget-item-list.out'
import { budgetItemListQuerySchema } from '@modules/projects/infrastructure/project.resource'
import type { ProjectController } from '@modules/projects/http/project.controller'

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

export function registerBudgetRoutes(router: OpenAPIHono, controller: ProjectController): void {
  router.openapi(addBudgetItemRoute, (c) => controller.addBudgetItem(c) as never)
  router.openapi(updateBudgetItemRoute, (c) => controller.updateBudgetItem(c) as never)
  router.openapi(removeBudgetItemRoute, (c) => controller.removeBudgetItem(c) as never)
  router.openapi(listBudgetItemsRoute, (c) => controller.listBudgetItems(c) as never)
}
