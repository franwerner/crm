import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { AddExtensionBodySchema, UpdateExtensionBodySchema } from '@modules/projects/http/dto/in/project-extension.in'
import { ProjectViewSchema } from '@modules/projects/http/dto/out/project.out'
import { ProjectExtensionListResponseSchema } from '@modules/projects/http/dto/out/project-extension-list.out'
import { extensionListQuerySchema } from '@modules/projects/infrastructure/project.resource'
import type { ProjectController } from '@modules/projects/http/project.controller'

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

export function registerExtensionRoutes(router: OpenAPIHono, controller: ProjectController): void {
  router.openapi(addExtensionRoute, (c) => controller.addExtension(c) as never)
  router.openapi(updateExtensionRoute, (c) => controller.updateExtension(c) as never)
  router.openapi(removeExtensionRoute, (c) => controller.removeExtension(c) as never)
  router.openapi(listExtensionsRoute, (c) => controller.listExtensions(c) as never)
}
