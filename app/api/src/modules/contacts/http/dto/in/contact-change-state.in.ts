import { z } from '@hono/zod-openapi'

const PipelineStateEnum = z.enum(['Contact', 'Lead', 'Customer', 'Discarded'])

export const ChangeStateBodySchema = z
  .object({
    newState: PipelineStateEnum.openapi({ description: 'Target pipeline state' }),
  })
  .openapi('ChangeStateBody')

export type ChangeStateRequest = z.infer<typeof ChangeStateBodySchema>
