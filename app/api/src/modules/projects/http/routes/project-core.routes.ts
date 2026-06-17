import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { CreateProjectBodySchema } from '@modules/projects/http/dto/in/project-create.in'
import { UpdateProjectBodySchema } from '@modules/projects/http/dto/in/project-update.in'
import { BulkDeleteProjectsBodySchema } from '@modules/projects/http/dto/in/project-bulk-delete.in'
import { ProjectViewSchema } from '@modules/projects/http/dto/out/project.out'
import { ProjectListResponseSchema } from '@modules/projects/http/dto/out/project-list.out'
import { ProjectKpisResponseSchema } from '@modules/projects/http/dto/out/project-kpis.out'
import { projectListQuerySchema } from '@modules/projects/infrastructure/project.resource'
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

const getProjectKpisRoute = createRoute({
  method: 'get',
  path: '/projects/kpis',
  summary: 'Get status KPIs for projects',
  tags: ['projects'],
  responses: {
    200: {
      description: 'Status KPIs for current and previous 30-day windows.',
      content: { 'application/json': { schema: ProjectKpisResponseSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const bulkDeleteProjectsRoute = createRoute({
  method: 'post',
  path: '/projects/bulk-delete',
  summary: 'Soft-delete multiple projects',
  tags: ['projects'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: BulkDeleteProjectsBodySchema } },
    },
  },
  responses: {
    204: { description: 'Projects deleted (missing IDs are ignored).' },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

export function registerCoreRoutes(router: OpenAPIHono, controller: ProjectController): void {
  router.openapi(createProjectRoute, (c) => controller.createProject(c) as never)
  router.openapi(listProjectsRoute, (c) => controller.listProjects(c) as never)
  router.openapi(getProjectKpisRoute, (c) => controller.getProjectKpis(c) as never)
  router.openapi(getProjectRoute, (c) => controller.getProject(c) as never)
  router.openapi(updateProjectRoute, (c) => controller.updateProject(c) as never)
  router.openapi(deleteProjectRoute, (c) => controller.deleteProject(c) as never)
  router.openapi(bulkDeleteProjectsRoute, (c) => controller.bulkDeleteProjects(c) as never)
}
