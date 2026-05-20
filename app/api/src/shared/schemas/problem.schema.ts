import { z } from '@hono/zod-openapi'

export const ProblemSchema = z.object({
  code: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string(),
  instance: z.string(),
}).openapi('Problem')
