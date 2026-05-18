import type { Contact } from './contact'

export interface ContactsRepository {
  findById(id: string): Promise<Contact | null>
  save(contact: Contact): Promise<void>
}
