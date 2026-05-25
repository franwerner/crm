import type { User } from '@modules/users/domain/user'
import type { UsersRepository } from '@modules/users/domain/user.repository'
import type { ListQuery } from '@shared/types/filters'
import type { Page } from '@shared/types/pagination'

export interface ListUsersInput extends ListQuery {}

export class UserListUseCase {
  constructor(private readonly repo: UsersRepository) {}

  async execute(input: ListUsersInput): Promise<Page<User>> {
    return this.repo.findMany(input)
  }
}
