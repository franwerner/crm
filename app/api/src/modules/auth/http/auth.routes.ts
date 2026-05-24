import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { LoginBodySchema } from '@modules/auth/http/dto/in/login.in'
import { LoginResponseSchema } from '@modules/auth/http/dto/out/login.out'
import { MeResponseSchema } from '@modules/auth/http/dto/out/me.out'
import type { AuthController } from '@modules/auth/http/auth.controller'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { authMiddleware } from '@shared/http/auth-middleware'

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

const meRoute = createRoute({
  method: 'get',
  path: '/auth/me',
  summary: 'Obtener usuario autenticado',
  tags: ['auth'],
  responses: {
    200: {
      description: 'Usuario autenticado.',
      content: { 'application/json': { schema: MeResponseSchema } },
    },
    401: {
      description: 'No autenticado.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

export function createAuthRouter(controller: AuthController): OpenAPIHono {
  const router = new OpenAPIHono()

  router.use('/auth/me', authMiddleware)

  router.openapi(loginRoute, (c) => controller.login(c) as never)
  router.openapi(logoutRoute, (c) => controller.logout(c))
  router.openapi(meRoute, (c) => controller.me(c) as never)

  return router
}
