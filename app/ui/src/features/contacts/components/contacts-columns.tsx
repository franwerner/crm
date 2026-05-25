import { toColumns } from '@shared/lib/data-view'
import { makeSelectColumn } from '@shared/ui/select-column'
import { contactsDescriptor } from '@features/contacts/contacts.descriptor'
import type { RowOf } from '@shared/lib/data-view'

type ContactRow = RowOf<typeof contactsDescriptor>

export const contactColumns = [
  makeSelectColumn<ContactRow>(),
  ...toColumns(contactsDescriptor),
]
