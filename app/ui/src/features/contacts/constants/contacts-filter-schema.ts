import { toFilterSchema } from '@shared/lib/data-view'
import { contactsDescriptor } from '@features/contacts/components/contacts.descriptor'

export const contactsFilterSchema = toFilterSchema(contactsDescriptor)
