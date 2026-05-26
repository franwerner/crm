import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactChannel } from '@modules/contacts/domain/entities/contact-channel'
import type { ContactAssignment } from '@modules/contacts/domain/entities/contact-assignment'
import type { ContactEvent } from '@modules/contacts/domain/entities/contact-event'
import type { ContactStateChange } from '@modules/contacts/domain/entities/contact-state-change'
import type { Page, PageParams } from '@shared/types/pagination'

export interface ContactsRepository {
  findById(id: string): Promise<Contact | null>
  create(contact: Contact): Promise<void>
  updateContact(contact: Contact): Promise<void>
  softDeleteMany(ids: string[], deletedAt: Date): Promise<void>
  addChannel(contact: Contact, channel: ContactChannel): Promise<void>
  updateChannel(contact: Contact, channelId: string): Promise<void>
  removeChannel(contact: Contact, channelId: string): Promise<void>
  addAssignment(contact: Contact, assignment: ContactAssignment): Promise<void>
  updateAssignmentRole(contact: Contact, userId: string): Promise<void>
  removeAssignment(contact: Contact, userId: string): Promise<void>
  appendEvent(contact: Contact): Promise<void>
  appendStateChange(contact: Contact): Promise<void>
  findEvents(contactId: string, params: PageParams): Promise<Page<ContactEvent>>
  findStateChanges(contactId: string, params: PageParams): Promise<Page<ContactStateChange>>
}
