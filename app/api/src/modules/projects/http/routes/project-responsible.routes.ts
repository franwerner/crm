import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { AddResponsibleBodySchema, UpdateResponsibleRoleBodySchema } from '@modules/projects/http/dto/in/project-responsible.in'
import { ProjectViewSchema } from '@modules/projects/http/dto/out/project.out'
import type { ProjectController } from '@modules/projects/http/project.controller'

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

export function registerResponsibleRoutes(router: OpenAPIHono, controller: ProjectController): void {
  router.openapi(addResponsibleRoute, (c) => controller.addResponsible(c) as never)
  router.openapi(updateResponsibleRoleRoute, (c) => controller.updateResponsibleRole(c) as never)
  router.openapi(removeResponsibleRoute, (c) => controller.removeResponsible(c) as never)
}
