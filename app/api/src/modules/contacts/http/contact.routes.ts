import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { authMiddleware } from '@shared/http/auth-middleware'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { PaginationQuerySchema } from '@shared/schemas/pagination.schema'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import { CreateContactBodySchema } from '@modules/contacts/http/dto/in/contact-create.in'
import { RegisterEventBodySchema } from '@modules/contacts/http/dto/in/contact-register-event.in'
import { ChangeStateBodySchema } from '@modules/contacts/http/dto/in/contact-change-state.in'
import { ContactViewSchema } from '@modules/contacts/http/dto/out/contact.out'
import { ContactListResponseSchema } from '@modules/contacts/http/dto/out/contact-list.out'
import { ContactEventListResponseSchema } from '@modules/contacts/http/dto/out/contact-event-list.out'
import { ContactStateChangeListResponseSchema } from '@modules/contacts/http/dto/out/contact-state-change-list.out'
import {
  createContactHandler,
  getContactHandler,
  listContactsHandler,
  registerEventHandler,
  listContactEventsHandler,
  listContactStateChangesHandler,
  changeContactStateHandler,
  deleteContactHandler,
} from '@modules/contacts/http/contact.controller'

const createContactRoute = createRoute({
  method: 'post',
  path: '/contacts',
  summary: 'Create a contact',
  tags: ['contacts'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: CreateContactBodySchema } },
    },
  },
  responses: {
    201: {
      description: 'Contact created.',
      content: { 'application/json': { schema: ContactViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const listContactsRoute = createRoute({
  method: 'get',
  path: '/contacts',
  summary: 'List contacts',
  tags: ['contacts'],
  request: {
    query: PaginationQuerySchema,
  },
  responses: {
    200: {
      description: 'Paginated list of contacts.',
      content: { 'application/json': { schema: ContactListResponseSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const getContactRoute = createRoute({
  method: 'get',
  path: '/contacts/:id',
  summary: 'Get a contact by id',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: 'Contact found.',
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

const registerEventRoute = createRoute({
  method: 'post',
  path: '/contacts/:id/events',
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
  path: '/contacts/:id/events',
  summary: 'List events for a contact',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string() }),
    query: PaginationQuerySchema,
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

const listContactStateChangesRoute = createRoute({
  method: 'get',
  path: '/contacts/:id/state-changes',
  summary: 'List state changes for a contact',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string() }),
    query: PaginationQuerySchema,
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

const changeContactStateRoute = createRoute({
  method: 'patch',
  path: '/contacts/:id/state',
  summary: 'Manually change contact pipeline state',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: ChangeStateBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'State changed. Returns updated contact.',
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

const deleteContactRoute = createRoute({
  method: 'delete',
  path: '/contacts/:id',
  summary: 'Soft-delete a contact',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: { description: 'Contact deleted.' },
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

export function createContactsRouter(repo: ContactsRepository): OpenAPIHono {
  const router = new OpenAPIHono()

  router.use('*', authMiddleware)

  router.openapi(createContactRoute, (c) => createContactHandler(c, repo) as never)
  router.openapi(listContactsRoute, (c) => listContactsHandler(c, repo) as never)
  router.openapi(getContactRoute, (c) => getContactHandler(c, repo) as never)
  router.openapi(registerEventRoute, (c) => registerEventHandler(c, repo) as never)
  router.openapi(listContactEventsRoute, (c) => listContactEventsHandler(c, repo) as never)
  router.openapi(listContactStateChangesRoute, (c) => listContactStateChangesHandler(c, repo) as never)
  router.openapi(changeContactStateRoute, (c) => changeContactStateHandler(c, repo) as never)
  router.openapi(deleteContactRoute, (c) => deleteContactHandler(c, repo) as never)

  return router
}
