import type { OpenAPIHono } from '@hono/zod-openapi'
import type { Db } from '@shared/db/client'
import { DrizzleUsersRepository } from '@modules/users/infrastructure/user.repository.bun'
import { UserCreateUseCase } from '@modules/users/application/use-cases/user-create.use-case'
import { UserGetUseCase } from '@modules/users/application/use-cases/user-get.use-case'
import { UserListUseCase } from '@modules/users/application/use-cases/user-list.use-case'
import { UserUpdateUseCase } from '@modules/users/application/use-cases/user-update.use-case'
import { UserDeleteUseCase } from '@modules/users/application/use-cases/user-delete.use-case'
import { UserController } from '@modules/users/http/user.controller'
import { createUsersRouter } from '@modules/users/http/user.routes'

export interface UsersModule {
  router: OpenAPIHono
}

export function bootstrapUsers(db: Db): UsersModule {
  const repo = new DrizzleUsersRepository(db)

  const controller = new UserController({
    create: new UserCreateUseCase(repo),
    get: new UserGetUseCase(repo),
    list: new UserListUseCase(repo),
    update: new UserUpdateUseCase(repo),
    delete: new UserDeleteUseCase(repo),
  })

  return {
    router: createUsersRouter(controller),
  }
}
