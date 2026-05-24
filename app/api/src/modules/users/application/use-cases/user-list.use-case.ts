import type { User } from '@modules/users/domain/user'
import type { UsersRepository } from '@modules/users/domain/user.repository'
import type { Page, PageParams } from '@shared/types/pagination'

export interface ListUsersInput extends PageParams {}

export class UserListUseCase {
  constructor(private readonly repo: UsersRepository) {}

  async execute(input: ListUsersInput): Promise<Page<User>> {
    return this.repo.findMany(input)
  }
}
