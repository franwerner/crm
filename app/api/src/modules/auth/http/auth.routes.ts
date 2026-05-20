import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import type { UsersPublicApi } from '@modules/users/public/user.public'
import { LoginBodySchema } from '@modules/auth/http/dto/in/login.in'
import { LoginResponseSchema } from '@modules/auth/http/dto/out/login.out'
import { loginHandler, logoutHandler } from '@modules/auth/http/auth.controller'
import { ProblemSchema } from '@shared/schemas/problem.schema'

const loginRoute = createRoute({
  method: 'post',
  path: '/auth/login',
  summary: 'Iniciar sesión',
  tags: ['auth'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: LoginBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Sesión iniciada. La cookie de sesión queda seteada.',
      content: { 'application/json': { schema: LoginResponseSchema } },
    },
    401: {
      description: 'Credenciales inválidas.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const logoutRoute = createRoute({
  method: 'post',
  path: '/auth/logout',
  summary: 'Cerrar sesión',
  tags: ['auth'],
  responses: {
    204: { description: 'Sesión cerrada. La cookie de sesión queda limpia.' },
  },
})

export function createAuthRouter(usersApi: UsersPublicApi): OpenAPIHono {
  const router = new OpenAPIHono()

  router.openapi(loginRoute, (c) => loginHandler(c, usersApi) as never)
  router.openapi(logoutRoute, (c) => logoutHandler(c))

  return router
}
