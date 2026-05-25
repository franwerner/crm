import { toFilterSchema } from '@shared/lib/data-view'
import { contactsDescriptor } from '@features/contacts/contacts.descriptor'

export const contactsFilterSchema = toFilterSchema(contactsDescriptor)
