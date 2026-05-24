import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { authMiddleware } from '@shared/http/auth-middleware'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { PaginationOnlyQuerySchema } from '@shared/http/list-query'
import { CreateUserBodySchema } from '@modules/users/http/dto/in/user-create.in'
import { UpdateUserBodySchema } from '@modules/users/http/dto/in/user-update.in'
import { UserViewSchema } from '@modules/users/http/dto/out/user.out'
import { UserListResponseSchema } from '@modules/users/http/dto/out/user-list.out'
import type { UserController } from '@modules/users/http/user.controller'

const createUserRoute = createRoute({
  method: 'post',
  path: '/users',
  summary: 'Create a user',
  tags: ['users'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: CreateUserBodySchema } },
    },
  },
  responses: {
    201: {
      description: 'User created.',
      content: { 'application/json': { schema: UserViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    409: {
      description: 'Email already registered.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const listUsersRoute = createRoute({
  method: 'get',
  path: '/users',
  summary: 'List users',
  tags: ['users'],
  request: {
    query: PaginationOnlyQuerySchema,
  },
  responses: {
    200: {
      description: 'Paginated list of users.',
      content: { 'application/json': { schema: UserListResponseSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const getUserRoute = createRoute({
  method: 'get',
  path: '/users/:id',
  summary: 'Get a user by id',
  tags: ['users'],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: 'User found.',
      content: { 'application/json': { schema: UserViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'User not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const updateUserRoute = createRoute({
  method: 'patch',
  path: '/users/:id',
  summary: 'Update a user (name and/or password)',
  tags: ['users'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateUserBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'User updated.',
      content: { 'application/json': { schema: UserViewSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'User not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const deleteUserRoute = createRoute({
  method: 'delete',
  path: '/users/:id',
  summary: 'Soft-delete a user',
  tags: ['users'],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: { description: 'User deleted.' },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'User not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

export function createUsersRouter(controller: UserController): OpenAPIHono {
  const router = new OpenAPIHono()

  router.use('*', authMiddleware)

  router.openapi(createUserRoute, (c) => controller.createUser(c) as never)
  router.openapi(listUsersRoute, (c) => controller.listUsers(c) as never)
  router.openapi(getUserRoute, (c) => controller.getUser(c) as never)
  router.openapi(updateUserRoute, (c) => controller.updateUser(c) as never)
  router.openapi(deleteUserRoute, (c) => controller.deleteUser(c) as never)

  return router
}
