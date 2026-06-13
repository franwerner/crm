import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { CreateContactBodySchema } from '@modules/contacts/http/dto/in/contact-create.in'
import { UpdateContactBodySchema } from '@modules/contacts/http/dto/in/contact-update.in'
import { BulkDeleteContactsBodySchema } from '@modules/contacts/http/dto/in/contact-bulk-delete.in'
import { ContactViewSchema } from '@modules/contacts/http/dto/out/contact.out'
import { ContactListResponseSchema } from '@modules/contacts/http/dto/out/contact-list.out'
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

export function registerContactCoreRoutes(router: OpenAPIHono, controller: ContactController): void {
  router.openapi(createContactRoute, (c) => controller.createContact(c) as never)
  router.openapi(listContactsRoute, (c) => controller.listContacts(c) as never)
  router.openapi(getContactKpisRoute, (c) => controller.getContactKpis(c) as never)
  router.openapi(getContactRoute, (c) => controller.getContact(c) as never)
  router.openapi(updateContactRoute, (c) => controller.updateContact(c) as never)
  router.openapi(deleteContactRoute, (c) => controller.deleteContact(c) as never)
  router.openapi(bulkDeleteContactsRoute, (c) => controller.bulkDeleteContacts(c) as never)
}
