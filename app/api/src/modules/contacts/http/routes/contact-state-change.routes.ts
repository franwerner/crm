import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { ContactStateChangeListResponseSchema } from '@modules/contacts/http/dto/out/contact-state-change-list.out'
import { PaginationOnlyQuerySchema } from '@shared/http/list-query'
import type { ContactController } from '@modules/contacts/http/contact.controller'

const listContactStateChangesRoute = createRoute({
  method: 'get',
  path: '/contacts/{id}/state-changes',
  summary: 'List state changes for a contact',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string() }),
    query: PaginationOnlyQuerySchema,
  },
  responses: {
    200: {
      description: 'Paginated list of state changes.',
      content: { 'application/json': { schema: ContactStateChangeListResponseSchema } },
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

export function registerContactStateChangeRoutes(router: OpenAPIHono, controller: ContactController): void {
  router.openapi(listContactStateChangesRoute, (c) => controller.listContactStateChanges(c) as never)
}
