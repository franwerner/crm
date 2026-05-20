import { eq } from 'drizzle-orm'
import type { Db } from '../../../shared/db/client'
import { users } from '../../../shared/db/schema'
import { User } from '../domain/user'
import type { UsersRepository } from '../domain/user.repository'

type UserRow = typeof users.$inferSelect

function reconstitute(row: UserRow): User {
  return User.reconstitute({
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  })
}

export class DrizzleUsersRepository implements UsersRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    })
    return row ? reconstitute(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    })
    return row ? reconstitute(row) : null
  }

  async save(user: User): Promise<void> {
    await this.db
      .insert(users)
      .values({
        id: user.id,
        email: user.email,
        name: user.name,
        password_hash: user.passwordHash,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        deleted_at: user.deletedAt,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          name: user.name,
          password_hash: user.passwordHash,
          updated_at: user.updatedAt,
          deleted_at: user.deletedAt,
        },
      })
  }
}
