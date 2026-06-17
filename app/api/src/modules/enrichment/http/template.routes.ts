import { createRoute, z } from '@hono/zod-openapi'
import { OpenAPIHono } from '@hono/zod-openapi'
import { authMiddleware } from '@shared/http/auth-middleware'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import {
  TemplateInSchema,
  TemplateUpdateInSchema,
  TemplateOutSchema,
} from '@modules/enrichment/http/dto/template.dto'
import type { TemplateController } from '@modules/enrichment/http/template.controller'

// POST /analysis-templates — create
const createTemplateRoute = createRoute({
  method: 'post',
  path: '/analysis-templates',
  summary: 'Create an analysis template',
  tags: ['analysis-templates'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: TemplateInSchema } },
    },
  },
  responses: {
    201: {
      description: 'Template created.',
      content: { 'application/json': { schema: TemplateOutSchema } },
    },
    400: { description: 'Validation error.', content: { 'application/problem+json': { schema: ProblemSchema } } },
    401: { description: 'Unauthorized.', content: { 'application/problem+json': { schema: ProblemSchema } } },
  },
})

// GET /analysis-templates — list
const listTemplatesRoute = createRoute({
  method: 'get',
  path: '/analysis-templates',
  summary: 'List all analysis templates',
  tags: ['analysis-templates'],
  responses: {
    200: {
      description: 'Array of templates.',
      content: { 'application/json': { schema: z.array(TemplateOutSchema) } },
    },
    401: { description: 'Unauthorized.', content: { 'application/problem+json': { schema: ProblemSchema } } },
  },
})

// PATCH /analysis-templates/:id — update
const updateTemplateRoute = createRoute({
  method: 'patch',
  path: '/analysis-templates/{id}',
  summary: 'Update an analysis template',
  tags: ['analysis-templates'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      required: true,
      content: { 'application/json': { schema: TemplateUpdateInSchema } },
    },
  },
  responses: {
    200: {
      description: 'Template updated.',
      content: { 'application/json': { schema: TemplateOutSchema } },
    },
    400: { description: 'Validation error.', content: { 'application/problem+json': { schema: ProblemSchema } } },
    401: { description: 'Unauthorized.', content: { 'application/problem+json': { schema: ProblemSchema } } },
    404: { description: 'Template not found.', content: { 'application/problem+json': { schema: ProblemSchema } } },
  },
})

// DELETE /analysis-templates/:id — deactivate (soft)
const deactivateTemplateRoute = createRoute({
  method: 'delete',
  path: '/analysis-templates/{id}',
  summary: 'Deactivate an analysis template',
  tags: ['analysis-templates'],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Template deactivated.',
      content: { 'application/json': { schema: TemplateOutSchema } },
    },
    401: { description: 'Unauthorized.', content: { 'application/problem+json': { schema: ProblemSchema } } },
    404: { description: 'Template not found.', content: { 'application/problem+json': { schema: ProblemSchema } } },
  },
})

export function createTemplateRouter(controller: TemplateController): OpenAPIHono {
  const router = new OpenAPIHono()

  router.use('*', authMiddleware)

  router.openapi(createTemplateRoute, (c) => controller.create(c) as never)
  router.openapi(listTemplatesRoute, (c) => controller.list(c) as never)
  router.openapi(updateTemplateRoute, (c) => controller.update(c) as never)
  router.openapi(deactivateTemplateRoute, (c) => controller.deactivate(c) as never)

  return router
}
