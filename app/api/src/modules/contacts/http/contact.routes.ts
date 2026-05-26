import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { authMiddleware } from '@shared/http/auth-middleware'
import { bracketedQueryMiddleware } from '@shared/http/bracketed-query'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { CreateContactBodySchema } from '@modules/contacts/http/dto/in/contact-create.in'
import { UpdateContactBodySchema } from '@modules/contacts/http/dto/in/contact-update.in'
import { AddChannelBodySchema, UpdateChannelBodySchema } from '@modules/contacts/http/dto/in/contact-channel.in'
import { BulkDeleteContactsBodySchema } from '@modules/contacts/http/dto/in/contact-bulk-delete.in'
import { AddAssignmentBodySchema, UpdateAssignmentRoleBodySchema } from '@modules/contacts/http/dto/in/contact-assignment.in'
import { PaginationOnlyQuerySchema } from '@shared/http/list-query'
import { RegisterEventBodySchema } from '@modules/contacts/http/dto/in/contact-register-event.in'
import { ContactViewSchema } from '@modules/contacts/http/dto/out/contact.out'
import { ContactListResponseSchema } from '@modules/contacts/http/dto/out/contact-list.out'
import { ContactEventListResponseSchema } from '@modules/contacts/http/dto/out/contact-event-list.out'
import { ContactStateChangeListResponseSchema } from '@modules/contacts/http/dto/out/contact-state-change-list.out'
import { ContactAssignmentListResponseSchema } from '@modules/contacts/http/dto/out/contact-assignment-list.out'
import { ContactKpisResponseSchema } from '@modules/contacts/http/dto/out/contact-kpis.out'
import { contactListQuerySchema } from '@modules/contacts/infrastructure/contact.resource'
import type { ContactController } from '@modules/contacts/http/contact.controller'

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

const getContactKpisRoute = createRoute({
  method: 'get',
  path: '/contacts/kpis',
  summary: 'Get pipeline-flow KPIs for contacts',
  tags: ['contacts'],
  responses: {
    200: {
      description: 'Pipeline KPIs for current and previous 30-day windows.',
      content: { 'application/json': { schema: ContactKpisResponseSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const getContactRoute = createRoute({
  method: 'get',
  path: '/contacts/{id}',
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

const deleteContactRoute = createRoute({
  method: 'delete',
  path: '/contacts/{id}',
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

const bulkDeleteContactsRoute = createRoute({
  method: 'post',
  path: '/contacts/bulk-delete',
  summary: 'Soft-delete multiple contacts',
  tags: ['contacts'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: BulkDeleteContactsBodySchema } },
    },
  },
  responses: {
    204: { description: 'Contacts deleted (missing IDs are ignored).' },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const updateContactRoute = createRoute({
  method: 'patch',
  path: '/contacts/{id}',
  summary: 'Update scalar and address fields of a contact',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateContactBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Contact updated.',
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

const addChannelRoute = createRoute({
  method: 'post',
  path: '/contacts/{id}/channels',
  summary: 'Add a communication channel to a contact',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: AddChannelBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Channel added. Returns updated contact.',
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

const updateChannelRoute = createRoute({
  method: 'patch',
  path: '/contacts/{id}/channels/{channelId}',
  summary: 'Update a communication channel on a contact',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string(), channelId: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateChannelBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Channel updated. Returns updated contact.',
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

const removeChannelRoute = createRoute({
  method: 'delete',
  path: '/contacts/{id}/channels/{channelId}',
  summary: 'Remove a communication channel from a contact',
  tags: ['contacts'],
  request: {
    params: z.object({ id: z.string(), channelId: z.string() }),
  },
  responses: {
    200: {
      description: 'Channel removed. Returns updated contact.',
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

export function createContactsRouter(controller: ContactController): OpenAPIHono {
  const router = new OpenAPIHono()

  router.use('*', bracketedQueryMiddleware)
  router.use('*', authMiddleware)

  const listContactsRoute = createRoute({
    method: 'get',
    path: '/contacts',
    summary: 'List contacts',
    tags: ['contacts'],
    request: {
      query: contactListQuerySchema,
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

  router.openapi(createContactRoute, (c) => controller.createContact(c) as never)
  router.openapi(listContactsRoute, (c) => controller.listContacts(c) as never)
  router.openapi(getContactKpisRoute, (c) => controller.getContactKpis(c) as never)
  router.openapi(getContactRoute, (c) => controller.getContact(c) as never)
  router.openapi(registerEventRoute, (c) => controller.registerEvent(c) as never)
  router.openapi(listContactEventsRoute, (c) => controller.listContactEvents(c) as never)
  router.openapi(listContactStateChangesRoute, (c) => controller.listContactStateChanges(c) as never)
  router.openapi(deleteContactRoute, (c) => controller.deleteContact(c) as never)
  router.openapi(bulkDeleteContactsRoute, (c) => controller.bulkDeleteContacts(c) as never)
  router.openapi(updateContactRoute, (c) => controller.updateContact(c) as never)
  router.openapi(addChannelRoute, (c) => controller.addChannel(c) as never)
  router.openapi(updateChannelRoute, (c) => controller.updateChannel(c) as never)
  router.openapi(removeChannelRoute, (c) => controller.removeChannel(c) as never)
  router.openapi(listContactAssignmentsRoute, (c) => controller.listContactAssignments(c) as never)
  router.openapi(addAssignmentRoute, (c) => controller.addAssignment(c) as never)
  router.openapi(updateAssignmentRoleRoute, (c) => controller.updateAssignmentRole(c) as never)
  router.openapi(removeAssignmentRoute, (c) => controller.removeAssignment(c) as never)

  return router
}
