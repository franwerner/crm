import type { UsersRepository } from '@modules/users/domain/user.repository'
import { NotFoundError } from '@shared/errors'

export interface DeleteUserInput {
  id: string
}

export interface DeleteUserDeps {
  repo: UsersRepository
}

export async function deleteUser(input: DeleteUserInput, deps: DeleteUserDeps): Promise<void> {
  const user = await deps.repo.findById(input.id)
  if (!user) {
    throw new NotFoundError(`User ${input.id} not found`)
  }

  const deleted = user.softDelete(new Date())
  await deps.repo.save(deleted)
}
