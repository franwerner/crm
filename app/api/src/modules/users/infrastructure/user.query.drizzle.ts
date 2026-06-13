import { asc, desc, isNull, sql, type AnyColumn } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { users } from '@shared/db/schema'
import { applyFilterGroups, applySearch, combineWhere } from '@shared/db/drizzle-filters'
import { userColumnMap, userSearchCols } from '@modules/users/infrastructure/user.resource'
import type { UserQueries, UserListInput, UserListItem } from '@modules/users/application/user.query'
import type { Page } from '@shared/types/pagination'

export class DrizzleUserQueries implements UserQueries {
  constructor(private readonly db: Db) {}

  async list(input: UserListInput): Promise<Page<UserListItem>> {
    const where = combineWhere([
      isNull(users.deletedAt),
      applyFilterGroups(userColumnMap, input.filterGroups),
      applySearch(userSearchCols, input.search),
    ])

    const sortableMap = userColumnMap as Record<string, AnyColumn>
    const sortCol = input.sort ? sortableMap[input.sort.field] : undefined
    const orderExpr = sortCol
      ? input.sort!.dir === 'asc'
        ? asc(sortCol)
        : desc(sortCol)
      : desc(users.createdAt)

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(users)
        .where(where),
      this.db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(where)
        .orderBy(orderExpr)
        .limit(input.pagination.limit)
        .offset(input.pagination.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items: UserListItem[] = rows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))

    return { items, total, limit: input.pagination.limit, offset: input.pagination.offset }
  }
}
