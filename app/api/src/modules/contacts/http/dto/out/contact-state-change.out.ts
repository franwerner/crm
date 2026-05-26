import { z } from '@hono/zod-openapi'

const PipelineStateEnum = z.enum(['Contact', 'Lead', 'AtRisk', 'Customer', 'Discarded'])

export const ContactStateChangeViewSchema = z
  .object({
    id: z.string().openapi({ description: 'State change UUID' }),
    contactId: z.string().openapi({ description: 'Contact UUID' }),
    previousState: PipelineStateEnum.openapi({ example: 'Contact' }),
    nextState: PipelineStateEnum.openapi({ example: 'Lead' }),
    changedAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
    createdAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
  })
  .openapi('ContactStateChangeView')

export type ContactStateChangeView = z.infer<typeof ContactStateChangeViewSchema>
