import type { Context } from 'hono'
import type { User } from '@modules/users/domain/user'
import type { UserCreateUseCase } from '@modules/users/application/use-cases/user-create.use-case'
import type { UserGetUseCase } from '@modules/users/application/use-cases/user-get.use-case'
import type { UserListUseCase } from '@modules/users/application/use-cases/user-list.use-case'
import type { UserUpdateUseCase } from '@modules/users/application/use-cases/user-update.use-case'
import type { UserDeleteUseCase } from '@modules/users/application/use-cases/user-delete.use-case'
import type { CreateUserRequest } from '@modules/users/http/dto/in/user-create.in'
import type { UpdateUserRequest } from '@modules/users/http/dto/in/user-update.in'
import type { PaginationOnlyQuery } from '@shared/http/list-query'

export interface UserUseCases {
  create: UserCreateUseCase
  get: UserGetUseCase
  list: UserListUseCase
  update: UserUpdateUseCase
  delete: UserDeleteUseCase
}

function toUserView(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export class UserController {
  constructor(private readonly ucs: UserUseCases) {}

  async createUser(c: Context): Promise<Response> {
    const body = c.req.valid('json' as never) as CreateUserRequest

    const user = await this.ucs.create.execute({
      email: body.email,
      name: body.name,
      password: body.password,
    })

    return c.json(toUserView(user), 201)
  }

  async getUser(c: Context): Promise<Response> {
    const id = c.req.param('id') as string

    const user = await this.ucs.get.execute({ id })

    return c.json(toUserView(user), 200)
  }

  async listUsers(c: Context): Promise<Response> {
    const query = c.req.valid('query' as never) as PaginationOnlyQuery

    const page = await this.ucs.list.execute({
      limit: query.pagination.limit,
      offset: query.pagination.offset,
    })

    return c.json(
      {
        items: page.items.map(toUserView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }

  async updateUser(c: Context): Promise<Response> {
    const id = c.req.param('id') as string
    const body = c.req.valid('json' as never) as UpdateUserRequest

    const user = await this.ucs.update.execute({
      id,
      name: body.name,
      password: body.password,
    })

    return c.json(toUserView(user), 200)
  }

  async deleteUser(c: Context): Promise<Response> {
    const id = c.req.param('id') as string

    await this.ucs.delete.execute({ id })

    return c.body(null, 204)
  }
}
