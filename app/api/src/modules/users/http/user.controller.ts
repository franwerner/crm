import type { Context } from 'hono'
import type { User } from '@modules/users/domain/user'
import type { UsersRepository } from '@modules/users/domain/user.repository'
import { createUser } from '@modules/users/application/use-cases/user-create.use-case'
import { getUser } from '@modules/users/application/use-cases/user-get.use-case'
import { listUsers } from '@modules/users/application/use-cases/user-list.use-case'
import { updateUser } from '@modules/users/application/use-cases/user-update.use-case'
import { deleteUser } from '@modules/users/application/use-cases/user-delete.use-case'
import type { CreateUserRequest } from '@modules/users/http/dto/in/user-create.in'
import type { UpdateUserRequest } from '@modules/users/http/dto/in/user-update.in'

function toUserView(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export async function createUserHandler(c: Context, repo: UsersRepository): Promise<Response> {
  const body = c.req.valid('json' as never) as CreateUserRequest

  const user = await createUser(
    { email: body.email, name: body.name, password: body.password },
    { repo },
  )

  return c.json(toUserView(user), 201)
}

export async function getUserHandler(c: Context, repo: UsersRepository): Promise<Response> {
  const id = c.req.param('id') as string

  const user = await getUser({ id }, { repo })

  return c.json(toUserView(user), 200)
}

export async function listUsersHandler(c: Context, repo: UsersRepository): Promise<Response> {
  const query = c.req.valid('query' as never) as { limit: number; offset: number }

  const page = await listUsers({ limit: query.limit, offset: query.offset }, { repo })

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

export async function updateUserHandler(c: Context, repo: UsersRepository): Promise<Response> {
  const id = c.req.param('id') as string
  const body = c.req.valid('json' as never) as UpdateUserRequest

  const user = await updateUser(
    { id, name: body.name, password: body.password },
    { repo },
  )

  return c.json(toUserView(user), 200)
}

export async function deleteUserHandler(c: Context, repo: UsersRepository): Promise<Response> {
  const id = c.req.param('id') as string

  await deleteUser({ id }, { repo })

  return c.body(null, 204)
}
