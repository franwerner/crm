import { getTableColumns } from 'drizzle-orm'
import { contacts } from '@shared/db/schema'
import { buildListQuerySchema } from '@shared/db/list-query-schema'

export const contactColumnMap = getTableColumns(contacts)

export const contactSearchCols = [contacts.name, contacts.handle, contacts.phone]

export const contactListQuerySchema = buildListQuerySchema(contactColumnMap, contactSearchCols)
