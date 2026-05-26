import type { OpenAPIHono } from '@hono/zod-openapi'
import type { Db } from '@shared/db/client'
import { DrizzleAuthUserQueries } from '@modules/auth/infrastructure/auth-user.query.drizzle'
import { LoginUseCase } from '@modules/auth/application/use-cases/login.use-case'
import { MeUseCase } from '@modules/auth/application/use-cases/me.use-case'
import { AuthController } from '@modules/auth/http/auth.controller'
import { createAuthRouter } from '@modules/auth/http/auth.routes'

export interface AuthModule {
  router: OpenAPIHono
}

export function bootstrapAuth(db: Db): AuthModule {
  const authUsers = new DrizzleAuthUserQueries(db)

  const controller = new AuthController({
    login: new LoginUseCase(authUsers),
    me: new MeUseCase(authUsers),
  })

  return {
    router: createAuthRouter(controller),
  }
}
