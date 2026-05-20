import type { UsersRepository } from '../domain/user.repository'
import type { UsersPublicApi } from './user.public'

export function createUsersPublicApi(repo: UsersRepository): UsersPublicApi {
  return {
    findByEmail: (email) =>
      repo.findByEmail(email).then((u) =>
        u ? { id: u.id, email: u.email, passwordHash: u.passwordHash } : null,
      ),
  }
}
