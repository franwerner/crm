import { z } from '@hono/zod-openapi'

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type LoginRequest = z.infer<typeof LoginBodySchema>
