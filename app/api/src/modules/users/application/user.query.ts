import type { ListQuery } from '@shared/types/filters'
import type { Page } from '@shared/types/pagination'

export interface UserListItem {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type UserListInput = ListQuery

export interface UserQueries {
  list(input: UserListInput): Promise<Page<UserListItem>>
}
