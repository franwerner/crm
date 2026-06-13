import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { AddChannelBodySchema, UpdateChannelBodySchema } from '@modules/contacts/http/dto/in/contact-channel.in'
import { ContactViewSchema } from '@modules/contacts/http/dto/out/contact.out'
import type { ContactController } from '@modules/contacts/http/contact.controller'

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

export function registerContactChannelRoutes(router: OpenAPIHono, controller: ContactController): void {
  router.openapi(addChannelRoute, (c) => controller.addChannel(c) as never)
  router.openapi(updateChannelRoute, (c) => controller.updateChannel(c) as never)
  router.openapi(removeChannelRoute, (c) => controller.removeChannel(c) as never)
}
