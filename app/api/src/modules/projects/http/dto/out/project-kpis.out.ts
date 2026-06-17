import { z } from '@hono/zod-openapi'

const ProjectStatusEnum = z.enum(['Draft', 'Active', 'Closed', 'Cancelled'])

export const ProjectKpiStateSchema = z.object({
  state: ProjectStatusEnum,
  current: z.number().int().nonnegative(),
  previous: z.number().int().nonnegative(),
})

export const ProjectKpisTotalSchema = z.object({
  count: z.number().int().nonnegative(),
  current: z.number().int().nonnegative(),
  previous: z.number().int().nonnegative(),
})

export const ProjectKpisResponseSchema = z
  .object({
    total: ProjectKpisTotalSchema,
    states: z.array(ProjectKpiStateSchema),
  })
  .openapi('ProjectKpisResponse')

export type ProjectKpisResponse = z.infer<typeof ProjectKpisResponseSchema>
