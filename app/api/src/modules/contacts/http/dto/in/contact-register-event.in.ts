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

export const RegisterEventBodySchema = z
  .object({
    eventType: EventTypeEnum.openapi({ description: 'Type of event' }),
    detail: z.string().default('').openapi({ description: 'Event notes', example: 'Sent proposal via email' }),
    occurredAt: z.string().openapi({ description: 'ISO 8601 timestamp of when the event occurred', example: '2024-01-01T00:00:00.000Z' }),
  })
  .openapi('RegisterEventBody')

export type RegisterEventRequest = z.infer<typeof RegisterEventBodySchema>
