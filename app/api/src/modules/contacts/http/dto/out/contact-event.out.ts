import { z } from '@hono/zod-openapi'

const EventTypeEnum = z.enum([
  'FirstContact',
  'MessageSent',
  'ResponseReceived',
  'MeetingCall',
  'ProposalSent',
  'ProposalWon',
  'ProposalRejected',
  'FollowUpPending',
  'Note',
])

export const ContactEventViewSchema = z
  .object({
    id: z.string().openapi({ description: 'Event UUID' }),
    contactId: z.string().openapi({ description: 'Contact UUID' }),
    authorId: z.string().openapi({ description: 'User UUID who authored the event' }),
    eventType: EventTypeEnum.openapi({ example: 'Note' }),
    detail: z.string().openapi({ example: 'Followed up by email' }),
    occurredAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
    createdAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
  })
  .openapi('ContactEventView')

export type ContactEventView = z.infer<typeof ContactEventViewSchema>
