import type { UsersRepository } from '@modules/users/domain/user.repository'
import { NotFoundError } from '@shared/errors'

export interface DeleteUserInput {
  id: string
}

export class UserDeleteUseCase {
  constructor(private readonly repo: UsersRepository) {}

  async execute(input: DeleteUserInput): Promise<void> {
    const user = await this.repo.findById(input.id)
    if (!user) {
      throw new NotFoundError(`User ${input.id} not found`)
    }

    const deleted = user.softDelete(new Date())
    await this.repo.save(deleted)
  }
}
