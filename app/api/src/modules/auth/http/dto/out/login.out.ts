import { z } from '@hono/zod-openapi'

export const LoginResponseSchema = z.object({
  userId: z.string(),
})

export type LoginResponse = z.infer<typeof LoginResponseSchema>
