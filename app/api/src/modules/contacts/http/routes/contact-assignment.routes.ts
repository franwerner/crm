import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { AddAssignmentBodySchema, UpdateAssignmentRoleBodySchema } from '@modules/contacts/http/dto/in/contact-assignment.in'
import { ContactViewSchema } from '@modules/contacts/http/dto/out/contact.out'
import { ContactAssignmentListResponseSchema } from '@modules/contacts/http/dto/out/contact-assignment-list.out'
import { PaginationOnlyQuerySchema } from '@shared/http/list-query'
import type { ContactController } from '@modules/contacts/http/contact.controller'

const listContactAssignmentsRoute = createRoute({
  method: 'get',
  path: '/contacts/{id}/assignments',
  summary: 'List assignments (assignees) of a contact',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string() }),
    query: PaginationOnlyQuerySchema,
  },
  responses: {
    200: {
      description: 'Paginated list of assignments.',
      content: { 'application/json': { schema: ContactAssignmentListResponseSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Contact not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const addAssignmentRoute = createRoute({
  method: 'post',
  path: '/contacts/{id}/assignments',
  summary: 'Assign a user to a contact',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: AddAssignmentBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Assignment added. Returns updated contact.',
      content: { 'application/json': { schema: ContactViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Contact not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const updateAssignmentRoleRoute = createRoute({
  method: 'patch',
  path: '/contacts/{id}/assignments/{userId}',
  summary: 'Update the role of an assignment',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string(), userId: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateAssignmentRoleBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Assignment role updated. Returns updated contact.',
      content: { 'application/json': { schema: ContactViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Contact or assignment not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const removeAssignmentRoute = createRoute({
  method: 'delete',
  path: '/contacts/{id}/assignments/{userId}',
  summary: 'Remove an assignment from a contact',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string(), userId: z.string() }),
  },
  responses: {
    200: {
      description: 'Assignment removed. Returns updated contact.',
      content: { 'application/json': { schema: ContactViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Contact or assignment not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

export function registerContactAssignmentRoutes(router: OpenAPIHono, controller: ContactController): void {
  router.openapi(listContactAssignmentsRoute, (c) => controller.listContactAssignments(c) as never)
  router.openapi(addAssignmentRoute, (c) => controller.addAssignment(c) as never)
  router.openapi(updateAssignmentRoleRoute, (c) => controller.updateAssignmentRole(c) as never)
  router.openapi(removeAssignmentRoute, (c) => controller.removeAssignment(c) as never)
}
