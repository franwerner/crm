import { z } from '@hono/zod-openapi'
import { paginatedResponseSchema } from '@shared/schemas/pagination.schema'
import { UserViewSchema } from '@modules/users/http/dto/out/user.out'

export const UserListResponseSchema = paginatedResponseSchema(UserViewSchema).openapi('UserListResponse')

export type UserListResponse = z.infer<typeof UserListResponseSchema>
