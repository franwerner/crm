import { z } from '@hono/zod-openapi'

export const UserViewSchema = z
  .object({
    id: z.string().openapi({ description: 'User UUID' }),
    email: z.string().openapi({ example: 'jane@example.com' }),
    name: z.string().openapi({ example: 'Jane Doe' }),
    createdAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
    updatedAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
  })
  .openapi('UserView')

export type UserView = z.infer<typeof UserViewSchema>
