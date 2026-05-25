import { and, asc, desc, eq, isNull, sql, type AnyColumn } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { users } from '@shared/db/schema'
import { User } from '@modules/users/domain/user'
import type { UsersRepository } from '@modules/users/domain/user.repository'
import type { ListQuery } from '@shared/types/filters'
import { applyFilterGroups, applySearch, combineWhere } from '@shared/db/drizzle-filters'
import { userColumnMap, userSearchCols } from '@modules/users/infrastructure/user.resource'
import type { Page } from '@shared/types/pagination'

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

  async findMany(query: ListQuery): Promise<Page<User>> {
    const where = combineWhere([
      isNull(users.deletedAt),
      applyFilterGroups(userColumnMap, query.filterGroups),
      applySearch(userSearchCols, query.search),
    ])

    const sortableMap = userColumnMap as Record<string, AnyColumn>
    const sortCol = query.sort ? sortableMap[query.sort.field] : undefined
    const orderExpr = sortCol
      ? query.sort!.dir === 'asc'
        ? asc(sortCol)
        : desc(sortCol)
      : desc(users.createdAt)

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(users)
        .where(where),
      this.db
        .select()
        .from(users)
        .where(where)
        .orderBy(orderExpr)
        .limit(query.pagination.limit)
        .offset(query.pagination.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)

    return {
      items: rows.map(reconstitute),
      total,
      limit: query.pagination.limit,
      offset: query.pagination.offset,
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
