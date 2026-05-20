import { z } from '@hono/zod-openapi'

export const UpdateUserBodySchema = z
  .object({
    name: z
      .string()
      .min(1)
      .optional()
      .openapi({ description: 'New full name', example: 'Jane D.' }),
    password: z
      .string()
      .min(8)
      .optional()
      .openapi({ description: 'New password (>= 8 chars)' }),
  })
  .refine((v) => v.name !== undefined || v.password !== undefined, {
    message: 'At least one of name or password must be provided',
  })
  .openapi('UpdateUserBody')

export type UpdateUserRequest = z.infer<typeof UpdateUserBodySchema>
