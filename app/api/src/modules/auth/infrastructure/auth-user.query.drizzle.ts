import { and, eq, isNull } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { users } from '@shared/db/schema'
import type {
  AuthUserQueries,
  AuthUserCredentials,
  AuthUserProfile,
} from '@modules/auth/application/auth-user.query'

export class DrizzleAuthUserQueries implements AuthUserQueries {
  constructor(private readonly db: Db) {}

  async findCredentialsByEmail(email: string): Promise<AuthUserCredentials | null> {
    const rows = await this.db
      .select({ id: users.id, email: users.email, passwordHash: users.passwordHash })
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1)
    const row = rows[0]
    return row ? { id: row.id, email: row.email, passwordHash: row.passwordHash } : null
  }

  async findProfileById(id: string): Promise<AuthUserProfile | null> {
    const rows = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1)
    const row = rows[0]
    return row
      ? {
          id: row.id,
          email: row.email,
          name: row.name,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }
      : null
  }
}
