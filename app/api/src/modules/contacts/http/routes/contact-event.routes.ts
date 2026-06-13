import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { RegisterEventBodySchema } from '@modules/contacts/http/dto/in/contact-register-event.in'
import { ContactViewSchema } from '@modules/contacts/http/dto/out/contact.out'
import { ContactEventListResponseSchema } from '@modules/contacts/http/dto/out/contact-event-list.out'
import { PaginationOnlyQuerySchema } from '@shared/http/list-query'
import type { ContactController } from '@modules/contacts/http/contact.controller'

const registerEventRoute = createRoute({
  method: 'post',
  path: '/contacts/{id}/events',
  summary: 'Register an event on a contact',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: RegisterEventBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Event registered. Returns updated contact.',
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

const listContactEventsRoute = createRoute({
  method: 'get',
  path: '/contacts/{id}/events',
  summary: 'List events for a contact',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string() }),
    query: PaginationOnlyQuerySchema,
  },
  responses: {
    200: {
      description: 'Paginated list of events.',
      content: { 'application/json': { schema: ContactEventListResponseSchema } },
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

export function registerContactEventRoutes(router: OpenAPIHono, controller: ContactController): void {
  router.openapi(registerEventRoute, (c) => controller.registerEvent(c) as never)
  router.openapi(listContactEventsRoute, (c) => controller.listContactEvents(c) as never)
}
