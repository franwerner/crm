import type { User } from '@modules/users/domain/user'
import type { UsersRepository } from '@modules/users/domain/user.repository'
import { NotFoundError } from '@shared/errors'

export interface GetUserInput {
  id: string
}

export interface GetUserDeps {
  repo: UsersRepository
}

export async function getUser(input: GetUserInput, deps: GetUserDeps): Promise<User> {
  const user = await deps.repo.findById(input.id)
  if (!user) {
    throw new NotFoundError(`User ${input.id} not found`)
  }
  return user
}
