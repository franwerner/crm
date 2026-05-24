import type { OpenAPIHono } from '@hono/zod-openapi'
import type { UsersPublicApi } from '@modules/users/public/user.public'
import { LoginUseCase } from '@modules/auth/application/use-cases/login.use-case'
import { MeUseCase } from '@modules/auth/application/use-cases/me.use-case'
import { AuthController } from '@modules/auth/http/auth.controller'
import { createAuthRouter } from '@modules/auth/http/auth.routes'

export interface AuthModule {
  router: OpenAPIHono
}

export function bootstrapAuth(usersApi: UsersPublicApi): AuthModule {
  const controller = new AuthController({
    login: new LoginUseCase(usersApi),
    me: new MeUseCase(usersApi),
  })

  return {
    router: createAuthRouter(controller),
  }
}
