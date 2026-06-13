import type { Db } from '@shared/db/client'
import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactChannel } from '@modules/contacts/domain/entities/contact-channel'
import type { ContactAssignment } from '@modules/contacts/domain/entities/contact-assignment'
import type { ContactEvent } from '@modules/contacts/domain/entities/contact-event'
import type { ContactStateChange } from '@modules/contacts/domain/entities/contact-state-change'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { Page, PageParams } from '@shared/types/pagination'
import { ContactCoreRepoPart } from './repositories/contact-core.repo-part'
import { ContactChannelRepoPart } from './repositories/contact-channel.repo-part'
import { ContactAssignmentRepoPart } from './repositories/contact-assignment.repo-part'
import { ContactEventRepoPart } from './repositories/contact-event.repo-part'
import { ContactStateChangeRepoPart } from './repositories/contact-state-change.repo-part'

export class DrizzleContactsRepository implements ContactsRepository {
  private readonly core: ContactCoreRepoPart
  private readonly channel: ContactChannelRepoPart
  private readonly assignment: ContactAssignmentRepoPart
  private readonly event: ContactEventRepoPart
  private readonly stateChange: ContactStateChangeRepoPart

  constructor(db: Db) {
    this.core = new ContactCoreRepoPart(db)
    this.channel = new ContactChannelRepoPart(db)
    this.assignment = new ContactAssignmentRepoPart(db)
    this.event = new ContactEventRepoPart(db)
    this.stateChange = new ContactStateChangeRepoPart(db)
  }

  findById(id: string): Promise<Contact | null> {
    return this.core.findById(id)
  }

  create(contact: Contact): Promise<void> {
    return this.core.create(contact)
  }

  updateContact(contact: Contact): Promise<void> {
    return this.core.updateContact(contact)
  }

  softDeleteMany(ids: string[], deletedAt: Date): Promise<void> {
    return this.core.softDeleteMany(ids, deletedAt)
  }

  appendEvent(contact: Contact): Promise<void> {
    return this.core.appendEvent(contact)
  }

  appendStateChange(contact: Contact): Promise<void> {
    return this.core.appendStateChange(contact)
  }

  addChannel(contact: Contact, channel: ContactChannel): Promise<void> {
    return this.channel.addChannel(contact, channel)
  }

  updateChannel(contact: Contact, channelId: string): Promise<void> {
    return this.channel.updateChannel(contact, channelId)
  }

  removeChannel(contact: Contact, channelId: string): Promise<void> {
    return this.channel.removeChannel(contact, channelId)
  }

  addAssignment(contact: Contact, assignment: ContactAssignment): Promise<void> {
    return this.assignment.addAssignment(contact, assignment)
  }

  updateAssignmentRole(contact: Contact, userId: string): Promise<void> {
    return this.assignment.updateAssignmentRole(contact, userId)
  }

  removeAssignment(contact: Contact, userId: string): Promise<void> {
    return this.assignment.removeAssignment(contact, userId)
  }

  findEvents(contactId: string, params: PageParams): Promise<Page<ContactEvent>> {
    return this.event.findEvents(contactId, params)
  }

  findStateChanges(contactId: string, params: PageParams): Promise<Page<ContactStateChange>> {
    return this.stateChange.findStateChanges(contactId, params)
  }
}
