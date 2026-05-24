import type { User } from '@modules/users/domain/user'
import type { UsersRepository } from '@modules/users/domain/user.repository'
import { NotFoundError } from '@shared/errors'

export interface GetUserInput {
  id: string
}

export class UserGetUseCase {
  constructor(private readonly repo: UsersRepository) {}

  async execute(input: GetUserInput): Promise<User> {
    const user = await this.repo.findById(input.id)
    if (!user) {
      throw new NotFoundError(`User ${input.id} not found`)
    }
    return user
  }
}
