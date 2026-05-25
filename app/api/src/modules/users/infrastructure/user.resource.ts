import { users } from '@shared/db/schema'
import { buildListQuerySchema } from '@shared/db/list-query-schema'
import { tableColumnsExcept } from '@shared/db/drizzle-filters'

export const userColumnMap = tableColumnsExcept(users, ['passwordHash', 'deletedAt'])

export const userSearchCols = [users.email, users.name]

export const userSortableFields = Object.keys(userColumnMap)

export const userListQuerySchema = buildListQuerySchema(userColumnMap, userSearchCols, userSortableFields)
