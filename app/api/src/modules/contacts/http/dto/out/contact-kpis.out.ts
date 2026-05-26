import { z } from '@hono/zod-openapi'

const PipelineStateEnum = z.enum(['Contact', 'Lead', 'AtRisk', 'Customer', 'Discarded'])

export const ContactKpiStateSchema = z.object({
  state: PipelineStateEnum,
  current: z.number().int().nonnegative(),
  previous: z.number().int().nonnegative(),
})

export const ContactKpisTotalSchema = z.object({
  count: z.number().int().nonnegative(),
  current: z.number().int().nonnegative(),
  previous: z.number().int().nonnegative(),
})

export const ContactKpisResponseSchema = z
  .object({
    total: ContactKpisTotalSchema,
    states: z.array(ContactKpiStateSchema),
  })
  .openapi('ContactKpisResponse')

export type ContactKpisResponse = z.infer<typeof ContactKpisResponseSchema>
