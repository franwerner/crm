import { and, desc, eq, inArray, isNull, ne, sql } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { contacts, contactChannels, contactAssignments, events, stateChanges } from '@shared/db/schema'
import { Contact } from '@modules/contacts/domain/contact'
import type { PipelineState } from '@modules/contacts/domain/types/pipeline-state'
import type { EventType } from '@modules/contacts/domain/types/event-type'
import type { SourceChannel } from '@modules/contacts/domain/types/source-channel'
import type { InterestLevel } from '@modules/contacts/domain/types/interest-level'
import type { ContactType } from '@modules/contacts/domain/types/contact-type'
import type { Sex } from '@modules/contacts/domain/types/sex'
import type { ChannelType } from '@modules/contacts/domain/types/channel-type'
import type { ContactAssignmentRole } from '@modules/contacts/domain/types/contact-assignment-role'
import type { StateChangeCause } from '@modules/contacts/domain/types/state-change-cause'
import type { ContactEvent } from '@modules/contacts/domain/entities/contact-event'
import type { ContactStateChange } from '@modules/contacts/domain/entities/contact-state-change'
import type { ContactChannel } from '@modules/contacts/domain/entities/contact-channel'
import type { ContactAssignment } from '@modules/contacts/domain/entities/contact-assignment'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { PageParams } from '@shared/types/pagination'
import type { Page } from '@shared/types/pagination'

type ContactRow = typeof contacts.$inferSelect
type EventRow = typeof events.$inferSelect
type StateChangeRow = typeof stateChanges.$inferSelect
type ContactChannelRow = typeof contactChannels.$inferSelect
type ContactAssignmentRow = typeof contactAssignments.$inferSelect

function toContactEvent(row: EventRow): ContactEvent {
  return {
    id: row.id,
    contactId: row.contactId,
    authorId: row.authorId,
    eventType: row.eventType as EventType,
    detail: row.detail,
    occurredAt: row.occurredAt,
    createdAt: row.createdAt,
  }
}

function toStateChangeCause(row: StateChangeRow): StateChangeCause {
  return { kind: 'event', eventId: row.causedByEventId ?? '' }
}

function toContactStateChange(row: StateChangeRow): ContactStateChange {
  return {
    id: row.id,
    contactId: row.contactId,
    previousState: row.previousState as PipelineState,
    nextState: row.nextState as PipelineState,
    cause: toStateChangeCause(row),
    changedAt: row.changedAt,
    createdAt: row.createdAt,
  }
}

function toContactChannel(row: ContactChannelRow): ContactChannel {
  return {
    id: row.id,
    contactId: row.contactId,
    channelType: row.channelType as ChannelType,
    value: row.value,
    isPrimary: row.isPrimary,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toContactAssignment(row: ContactAssignmentRow): ContactAssignment {
  return {
    id: row.id,
    contactId: row.contactId,
    userId: row.userId,
    role: row.role as ContactAssignmentRole,
    assignedBy: row.assignedBy,
    assignedAt: row.assignedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function reconstitute(
  contactRow: ContactRow,
  eventRows: EventRow[],
  stateChangeRows: StateChangeRow[],
  channelRows: ContactChannelRow[],
  assignmentRows: ContactAssignmentRow[],
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
    events: eventRows.map(toContactEvent),
    stateChanges: stateChangeRows.map(toContactStateChange),
    channels: channelRows.map(toContactChannel),
    assignments: assignmentRows.map(toContactAssignment),
  })
}

function toContactRow(contact: Contact): typeof contacts.$inferInsert {
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

function toAssignmentRow(a: ContactAssignment): typeof contactAssignments.$inferInsert {
  return {
    id: a.id,
    contactId: a.contactId,
    userId: a.userId,
    role: a.role,
    assignedBy: a.assignedBy,
    assignedAt: a.assignedAt,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }
}

function toEventRow(e: ContactEvent): typeof events.$inferInsert {
  return {
    id: e.id,
    contactId: e.contactId,
    authorId: e.authorId,
    eventType: e.eventType,
    detail: e.detail,
    occurredAt: e.occurredAt,
    createdAt: e.createdAt,
  }
}

function toStateChangeRow(sc: ContactStateChange): typeof stateChanges.$inferInsert {
  return {
    id: sc.id,
    contactId: sc.contactId,
    previousState: sc.previousState,
    nextState: sc.nextState,
    causedByEventId: sc.cause.eventId,
    changedAt: sc.changedAt,
    createdAt: sc.createdAt,
  }
}

function toChannelRow(ch: ContactChannel): typeof contactChannels.$inferInsert {
  return {
    id: ch.id,
    contactId: ch.contactId,
    channelType: ch.channelType,
    value: ch.value,
    isPrimary: ch.isPrimary,
    createdAt: ch.createdAt,
    updatedAt: ch.updatedAt,
  }
}

export class DrizzleContactsRepository implements ContactsRepository {
  constructor(private readonly db: Db) {}

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

    return reconstitute(contactRow, eventRows, stateChangeRows, channelRows, assignmentRows)
  }

  private async updateContactRow(tx: Parameters<Parameters<typeof this.db.transaction>[0]>[0], contact: Contact): Promise<void> {
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

  async addChannel(contact: Contact, channel: ContactChannel): Promise<void> {
    await this.db.transaction(async (tx) => {
      if (channel.isPrimary) {
        await tx
          .update(contactChannels)
          .set({ isPrimary: false })
          .where(eq(contactChannels.contactId, contact.id))
      }
      await tx.insert(contactChannels).values(toChannelRow(channel))
      await tx
        .update(contacts)
        .set({ updatedAt: contact.updatedAt })
        .where(eq(contacts.id, contact.id))
    })
  }

  async updateChannel(contact: Contact, channelId: string): Promise<void> {
    const channel = contact.channels.find((ch) => ch.id === channelId)
    if (!channel) return

    await this.db.transaction(async (tx) => {
      if (channel.isPrimary) {
        await tx
          .update(contactChannels)
          .set({ isPrimary: false })
          .where(and(eq(contactChannels.contactId, contact.id), ne(contactChannels.id, channelId)))
      }
      await tx
        .update(contactChannels)
        .set({
          channelType: channel.channelType,
          value: channel.value,
          isPrimary: channel.isPrimary,
          updatedAt: channel.updatedAt,
        })
        .where(eq(contactChannels.id, channelId))
      await tx
        .update(contacts)
        .set({ updatedAt: contact.updatedAt })
        .where(eq(contacts.id, contact.id))
    })
  }

  async removeChannel(contact: Contact, channelId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(contactChannels).where(eq(contactChannels.id, channelId))
      await tx
        .update(contacts)
        .set({ updatedAt: contact.updatedAt })
        .where(eq(contacts.id, contact.id))
    })
  }

  async addAssignment(contact: Contact, assignment: ContactAssignment): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(contactAssignments).values(toAssignmentRow(assignment))
      await tx
        .update(contacts)
        .set({ updatedAt: contact.updatedAt })
        .where(eq(contacts.id, contact.id))
    })
  }

  async updateAssignmentRole(contact: Contact, userId: string): Promise<void> {
    const assignment = contact.assignments.find((a) => a.userId === userId)
    if (!assignment) return

    await this.db.transaction(async (tx) => {
      await tx
        .update(contactAssignments)
        .set({ role: assignment.role, updatedAt: assignment.updatedAt })
        .where(and(eq(contactAssignments.contactId, contact.id), eq(contactAssignments.userId, userId)))
      await tx
        .update(contacts)
        .set({ updatedAt: contact.updatedAt })
        .where(eq(contacts.id, contact.id))
    })
  }

  async removeAssignment(contact: Contact, userId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(contactAssignments)
        .where(and(eq(contactAssignments.contactId, contact.id), eq(contactAssignments.userId, userId)))
      await tx
        .update(contacts)
        .set({ updatedAt: contact.updatedAt })
        .where(eq(contacts.id, contact.id))
    })
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

  async findEvents(contactId: string, params: PageParams): Promise<Page<ContactEvent>> {
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(events)
        .where(eq(events.contactId, contactId)),
      this.db
        .select()
        .from(events)
        .where(eq(events.contactId, contactId))
        .orderBy(desc(events.occurredAt))
        .limit(params.limit)
        .offset(params.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items = rows.map(toContactEvent)

    return { items, total, limit: params.limit, offset: params.offset }
  }

  async findStateChanges(contactId: string, params: PageParams): Promise<Page<ContactStateChange>> {
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(stateChanges)
        .where(eq(stateChanges.contactId, contactId)),
      this.db
        .select()
        .from(stateChanges)
        .where(eq(stateChanges.contactId, contactId))
        .orderBy(desc(stateChanges.changedAt))
        .limit(params.limit)
        .offset(params.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items = rows.map(toContactStateChange)

    return { items, total, limit: params.limit, offset: params.offset }
  }
}
