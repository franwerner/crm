import type { UserQueries, UserListInput, UserListItem } from '@modules/users/application/user.query'
import type { Page } from '@shared/types/pagination'

export class UserListUseCase {
  constructor(private readonly queries: UserQueries) {}

  async execute(input: UserListInput): Promise<Page<UserListItem>> {
    return this.queries.list(input)
  }
}
