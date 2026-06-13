import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { ChangeProjectStateBodySchema } from '@modules/projects/http/dto/in/project-change-state.in'
import { ProjectViewSchema } from '@modules/projects/http/dto/out/project.out'
import { ProjectStateChangeListResponseSchema } from '@modules/projects/http/dto/out/project-state-change-list.out'
import { stateChangeListQuerySchema } from '@modules/projects/infrastructure/project.resource'
import type { ProjectController } from '@modules/projects/http/project.controller'

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

export function registerStateChangeRoutes(router: OpenAPIHono, controller: ProjectController): void {
  router.openapi(changeStateRoute, (c) => controller.changeState(c) as never)
  router.openapi(listStateChangesRoute, (c) => controller.listStateChanges(c) as never)
}
