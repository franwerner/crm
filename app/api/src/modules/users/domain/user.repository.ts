import type { User } from '@modules/users/domain/user'
import type { Page, PageParams } from '@shared/types/pagination'

export interface UsersRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findMany(params: PageParams): Promise<Page<User>>
  save(user: User): Promise<void>
}
