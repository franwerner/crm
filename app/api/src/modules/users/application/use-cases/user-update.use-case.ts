import type { User } from '@modules/users/domain/user'
import type { UsersRepository } from '@modules/users/domain/user.repository'
import { NotFoundError } from '@shared/errors'

export interface UpdateUserInput {
  id: string
  name?: string
  password?: string
}

export interface UpdateUserDeps {
  repo: UsersRepository
}

export async function updateUser(input: UpdateUserInput, deps: UpdateUserDeps): Promise<User> {
  const user = await deps.repo.findById(input.id)
  if (!user) {
    throw new NotFoundError(`User ${input.id} not found`)
  }

  const now = new Date()
  let next = user

  if (input.name !== undefined) {
    next = next.rename(input.name, now)
  }

  if (input.password !== undefined) {
    const passwordHash = await Bun.password.hash(input.password)
    next = next.changePassword(passwordHash, now)
  }

  if (next === user) {
    return user
  }

  await deps.repo.save(next)
  return next
}
