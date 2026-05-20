import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactEvent } from '@modules/contacts/domain/entities/contact-event'
import type { ContactStateChange } from '@modules/contacts/domain/entities/contact-state-change'
import type { Page, PageParams } from '@shared/types/pagination'

export interface ContactsRepository {
  findById(id: string): Promise<Contact | null>
  save(contact: Contact): Promise<void>
  findMany(params: PageParams): Promise<Page<Contact>>
  findEvents(contactId: string, params: PageParams): Promise<Page<ContactEvent>>
  findStateChanges(contactId: string, params: PageParams): Promise<Page<ContactStateChange>>
}
