import type { User } from '@modules/users/domain/user'
import type { ListQuery } from '@shared/types/filters'
import type { Page } from '@shared/types/pagination'

export interface UsersRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findMany(query: ListQuery): Promise<Page<User>>
  save(user: User): Promise<void>
}
