import { getTableColumns } from 'drizzle-orm'
import { users } from '@shared/db/schema'
import { buildListQuerySchema } from '@shared/db/list-query-schema'

export const userColumnMap = getTableColumns(users)

export const userSearchCols = [users.email, users.name]

export const userListQuerySchema = buildListQuerySchema(userColumnMap, userSearchCols)
