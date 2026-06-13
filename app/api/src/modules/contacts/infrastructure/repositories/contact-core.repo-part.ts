import { and, eq, inArray, isNull } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { contacts, contactChannels, events, stateChanges, contactAssignments } from '@shared/db/schema'
import { Contact } from '@modules/contacts/domain/contact'
import type { PipelineState } from '@modules/contacts/domain/types/pipeline-state'
import type { SourceChannel } from '@modules/contacts/domain/types/source-channel'
import type { InterestLevel } from '@modules/contacts/domain/types/interest-level'
import type { ContactType } from '@modules/contacts/domain/types/contact-type'
import type { Sex } from '@modules/contacts/domain/types/sex'
import type { ContactEvent } from '@modules/contacts/domain/entities/contact-event'
import type { ContactStateChange } from '@modules/contacts/domain/entities/contact-state-change'
import type { ContactChannel } from '@modules/contacts/domain/entities/contact-channel'
import type { ContactAssignment } from '@modules/contacts/domain/entities/contact-assignment'
import { toContactEvent, toEventRow } from './contact-event.repo-part'
import { toContactStateChange, toStateChangeRow } from './contact-state-change.repo-part'
import { toContactChannel, toChannelRow } from './contact-channel.repo-part'
import { toContactAssignment } from './contact-assignment.repo-part'

type ContactRow = typeof contacts.$inferSelect

export function toContactRow(contact: Contact): typeof contacts.$inferInsert {
  return {
    id: contact.id,
    name: contact.name,
    contactType: contact.contactType,
    sex: contact.sex,
    addressStreet: contact.address.street,
    addressNumber: contact.address.number,
    addressPostalCode: contact.address.postalCode,
    addressCity: contact.address.city,
    addressProvince: contact.address.province,
    addressCountry: contact.address.country,
    notes: contact.notes,
    pipelineState: contact.pipelineState,
    sourceChannel: contact.sourceChannel,
    interestLevel: contact.interestLevel,
    createdBy: contact.createdBy,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
    deletedAt: contact.deletedAt,
  }
}

function reconstitute(
  contactRow: ContactRow,
  eventRows: ContactEvent[],
  stateChangeRows: ContactStateChange[],
  channelRows: ContactChannel[],
  assignmentRows: ContactAssignment[],
): Contact {
  return Contact.reconstitute({
    id: contactRow.id,
    name: contactRow.name,
    contactType: contactRow.contactType as ContactType,
    sex: contactRow.sex as Sex | null,
    address: {
      street: contactRow.addressStreet,
      number: contactRow.addressNumber,
      postalCode: contactRow.addressPostalCode,
      city: contactRow.addressCity,
      province: contactRow.addressProvince,
      country: contactRow.addressCountry,
    },
    notes: contactRow.notes,
    pipelineState: contactRow.pipelineState as PipelineState,
    sourceChannel: contactRow.sourceChannel as SourceChannel | null,
    interestLevel: contactRow.interestLevel as InterestLevel | null,
    createdBy: contactRow.createdBy,
    createdAt: contactRow.createdAt,
    updatedAt: contactRow.updatedAt,
    deletedAt: contactRow.deletedAt,
    events: eventRows,
    stateChanges: stateChangeRows,
    channels: channelRows,
    assignments: assignmentRows,
  })
}

export class ContactCoreRepoPart {
  constructor(private readonly db: Db) {}

  async updateContactRow(
    tx: Parameters<Parameters<typeof this.db.transaction>[0]>[0],
    contact: Contact,
  ): Promise<void> {
    const row = toContactRow(contact)
    await tx
      .update(contacts)
      .set({
        name: row.name,
        contactType: row.contactType,
        sex: row.sex,
        addressStreet: row.addressStreet,
        addressNumber: row.addressNumber,
        addressPostalCode: row.addressPostalCode,
        addressCity: row.addressCity,
        addressProvince: row.addressProvince,
        addressCountry: row.addressCountry,
        notes: row.notes,
        pipelineState: row.pipelineState,
        sourceChannel: row.sourceChannel,
        interestLevel: row.interestLevel,
        deletedAt: row.deletedAt,
        updatedAt: row.updatedAt,
      })
      .where(eq(contacts.id, contact.id))
  }

  async findById(id: string): Promise<Contact | null> {
    const contactRow = await this.db.query.contacts.findFirst({
      where: and(eq(contacts.id, id), isNull(contacts.deletedAt)),
    })

    if (!contactRow) return null

    const [eventRows, stateChangeRows, channelRows, assignmentRows] = await Promise.all([
      this.db.query.events.findMany({
        where: eq(events.contactId, id),
      }),
      this.db.query.stateChanges.findMany({
        where: eq(stateChanges.contactId, id),
      }),
      this.db.query.contactChannels.findMany({
        where: eq(contactChannels.contactId, id),
      }),
      this.db.query.contactAssignments.findMany({
        where: eq(contactAssignments.contactId, id),
      }),
    ])

    return reconstitute(
      contactRow,
      eventRows.map(toContactEvent),
      stateChangeRows.map(toContactStateChange),
      channelRows.map(toContactChannel),
      assignmentRows.map(toContactAssignment),
    )
  }

  async create(contact: Contact): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(contacts).values(toContactRow(contact))
      if (contact.channels.length > 0) {
        await tx.insert(contactChannels).values(contact.channels.map(toChannelRow))
      }
    })
  }

  async updateContact(contact: Contact): Promise<void> {
    await this.db.transaction(async (tx) => {
      await this.updateContactRow(tx, contact)
    })
  }

  async softDeleteMany(ids: string[], deletedAt: Date): Promise<void> {
    if (ids.length === 0) return
    await this.db
      .update(contacts)
      .set({ deletedAt, updatedAt: deletedAt })
      .where(and(inArray(contacts.id, ids), isNull(contacts.deletedAt)))
  }

  async appendEvent(contact: Contact): Promise<void> {
    const newEvents = contact.newEvents
    const newStateChanges = contact.newStateChanges

    await this.db.transaction(async (tx) => {
      if (newEvents.length > 0) {
        await tx.insert(events).values(newEvents.map(toEventRow))
      }
      if (newStateChanges.length > 0) {
        await tx.insert(stateChanges).values(newStateChanges.map(toStateChangeRow))
      }
      await this.updateContactRow(tx, contact)
    })
  }

  async appendStateChange(contact: Contact): Promise<void> {
    const newStateChanges = contact.newStateChanges

    await this.db.transaction(async (tx) => {
      if (newStateChanges.length > 0) {
        await tx.insert(stateChanges).values(newStateChanges.map(toStateChangeRow))
      }
      await this.updateContactRow(tx, contact)
    })
  }
}
