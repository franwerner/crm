import { getTableColumns } from 'drizzle-orm'
import { contacts } from '@shared/db/schema'
import { buildListRawSchema, toListQuery } from '@shared/db/list-query-schema'
import type { ContactListInput } from '@modules/contacts/application/contact.query'

export const contactColumnMap = getTableColumns(contacts)

export const contactSearchCols = [contacts.name]

export const contactSortableFields = Object.keys(contactColumnMap)

const contactRawSchema = buildListRawSchema(contactColumnMap)

export const contactListQuerySchema = contactRawSchema.transform(
  (raw): ContactListInput => toListQuery(raw, contactSortableFields),
)
