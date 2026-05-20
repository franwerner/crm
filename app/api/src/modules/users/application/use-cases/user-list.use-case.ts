import type { User } from '@modules/users/domain/user'
import type { UsersRepository } from '@modules/users/domain/user.repository'
import type { Page, PageParams } from '@shared/types/pagination'

export interface ListUsersInput extends PageParams {}

export interface ListUsersDeps {
  repo: UsersRepository
}

export async function listUsers(input: ListUsersInput, deps: ListUsersDeps): Promise<Page<User>> {
  return deps.repo.findMany(input)
}
