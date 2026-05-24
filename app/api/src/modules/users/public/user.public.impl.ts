import type { UsersRepository } from '@modules/users/domain/user.repository'
import type { UsersPublicApi } from '@modules/users/public/user.public'

export function createUsersPublicApi(repo: UsersRepository): UsersPublicApi {
  return {
    findByEmail: (email) =>
      repo.findByEmail(email).then((u) =>
        u ? { id: u.id, email: u.email, passwordHash: u.passwordHash } : null,
      ),
    findById: (id) =>
      repo.findById(id).then((u) =>
        u ? { id: u.id, email: u.email, name: u.name, createdAt: u.createdAt, updatedAt: u.updatedAt } : null,
      ),
  }
}
