import type { Contact } from './contact'
import type { ContactEvent } from './entities/contact-event'
import type { ContactStateChange } from './entities/contact-state-change'
import type { Page, PageParams } from '../../../shared/types/pagination'

export interface ContactsRepository {
  findById(id: string): Promise<Contact | null>
  save(contact: Contact): Promise<void>
  findMany(params: PageParams): Promise<Page<Contact>>
  findEvents(contactId: string, params: PageParams): Promise<Page<ContactEvent>>
  findStateChanges(contactId: string, params: PageParams): Promise<Page<ContactStateChange>>
}
