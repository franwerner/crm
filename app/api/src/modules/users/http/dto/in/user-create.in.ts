import { z } from '@hono/zod-openapi'

export const CreateUserBodySchema = z
  .object({
    email: z
      .string()
      .email()
      .openapi({ description: 'User email (unique)', example: 'jane@example.com' }),
    name: z
      .string()
      .min(1)
      .openapi({ description: 'User full name', example: 'Jane Doe' }),
    password: z
      .string()
      .min(8)
      .openapi({ description: 'Password (>= 8 chars)', example: 'correct-horse' }),
  })
  .openapi('CreateUserBody')

export type CreateUserRequest = z.infer<typeof CreateUserBodySchema>
