import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { users } from '@shared/db/schema'
import { User } from '@modules/users/domain/user'
import type { UsersRepository } from '@modules/users/domain/user.repository'
import type { Page, PageParams } from '@shared/types/pagination'

type UserRow = typeof users.$inferSelect

function reconstitute(row: UserRow): User {
  return User.reconstitute({
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  })
}

export class DrizzleUsersRepository implements UsersRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.query.users.findFirst({
      where: and(eq(users.id, id), isNull(users.deletedAt)),
    })
    return row ? reconstitute(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.query.users.findFirst({
      where: and(eq(users.email, email.toLowerCase().trim()), isNull(users.deletedAt)),
    })
    return row ? reconstitute(row) : null
  }

  async findMany(params: PageParams): Promise<Page<User>> {
    const totalRow = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(isNull(users.deletedAt))
    const total = totalRow[0]?.count ?? 0

    const rows = await this.db.query.users.findMany({
      where: isNull(users.deletedAt),
      orderBy: [desc(users.createdAt)],
      limit: params.limit,
      offset: params.offset,
    })

    return {
      items: rows.map(reconstitute),
      total,
      limit: params.limit,
      offset: params.offset,
    }
  }

  async save(user: User): Promise<void> {
    await this.db
      .insert(users)
      .values({
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          name: user.name,
          passwordHash: user.passwordHash,
          updatedAt: user.updatedAt,
          deletedAt: user.deletedAt,
        },
      })
  }
}
