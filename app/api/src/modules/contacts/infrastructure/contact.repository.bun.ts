import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { contacts, events, stateChanges } from '@shared/db/schema'
import { Contact } from '@modules/contacts/domain/contact'
import type { PipelineState } from '@modules/contacts/domain/types/pipeline-state'
import type { EventType } from '@modules/contacts/domain/types/event-type'
import type { SourceChannel } from '@modules/contacts/domain/types/source-channel'
import type { InterestLevel } from '@modules/contacts/domain/types/interest-level'
import type { StateChangeCause } from '@modules/contacts/domain/types/state-change-cause'
import type { ContactEvent } from '@modules/contacts/domain/entities/contact-event'
import type { ContactStateChange } from '@modules/contacts/domain/entities/contact-state-change'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { ListQuery } from '@shared/types/filters'
import { applyFilterSet, applySearch, combineWhere } from '@shared/db/drizzle-filters'
import { contactColumnMap, contactSearchCols } from '@modules/contacts/infrastructure/contact.resource'
import type { Page, PageParams } from '@shared/types/pagination'

type ContactRow = typeof contacts.$inferSelect
type EventRow = typeof events.$inferSelect
type StateChangeRow = typeof stateChanges.$inferSelect

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
  if (row.causedByEventId !== null) {
    return { kind: 'event', eventId: row.causedByEventId }
  }
  if (row.causedByUserId !== null) {
    return { kind: 'manual', userId: row.causedByUserId }
  }
  return { kind: 'manual', userId: '' }
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

function reconstitute(
  contactRow: ContactRow,
  eventRows: EventRow[],
  stateChangeRows: StateChangeRow[],
): Contact {
  return Contact.reconstitute({
    id: contactRow.id,
    name: contactRow.name,
    handle: contactRow.handle,
    phone: contactRow.phone,
    pipelineState: contactRow.pipelineState as PipelineState,
    stateLocked: contactRow.stateLocked,
    sourceChannel: contactRow.sourceChannel as SourceChannel | null,
    interestLevel: contactRow.interestLevel as InterestLevel | null,
    createdBy: contactRow.createdBy,
    createdAt: contactRow.createdAt,
    updatedAt: contactRow.updatedAt,
    deletedAt: contactRow.deletedAt,
    events: eventRows.map(toContactEvent),
    stateChanges: stateChangeRows.map(toContactStateChange),
  })
}

function toContactRow(contact: Contact): typeof contacts.$inferInsert {
  return {
    id: contact.id,
    name: contact.name,
    handle: contact.handle,
    phone: contact.phone,
    pipelineState: contact.pipelineState,
    stateLocked: contact.stateLocked,
    sourceChannel: contact.sourceChannel,
    interestLevel: contact.interestLevel,
    createdBy: contact.createdBy,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
    deletedAt: contact.deletedAt,
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
    causedByEventId: sc.cause.kind === 'event' ? sc.cause.eventId : null,
    causedByUserId: sc.cause.kind === 'manual' ? sc.cause.userId : null,
    changedAt: sc.changedAt,
    createdAt: sc.createdAt,
  }
}

export class DrizzleContactsRepository implements ContactsRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<Contact | null> {
    const contactRow = await this.db.query.contacts.findFirst({
      where: and(eq(contacts.id, id), isNull(contacts.deletedAt)),
    })

    if (!contactRow) return null

    const eventRows = await this.db.query.events.findMany({
      where: eq(events.contactId, id),
    })

    const stateChangeRows = await this.db.query.stateChanges.findMany({
      where: eq(stateChanges.contactId, id),
    })

    return reconstitute(contactRow, eventRows, stateChangeRows)
  }

  async save(contact: Contact): Promise<void> {
    const newEvents = contact.newEvents
    const newStateChanges = contact.newStateChanges

    await this.db.transaction(async (tx) => {
      const contactInsert = toContactRow(contact)
      const { id: _id, createdAt: _ca, createdBy: _cb, ...updateSet } = contactInsert

      await tx
        .insert(contacts)
        .values(contactInsert)
        .onConflictDoUpdate({
          target: contacts.id,
          set: updateSet,
        })

      if (newEvents.length > 0) {
        await tx.insert(events).values(newEvents.map(toEventRow))
      }

      if (newStateChanges.length > 0) {
        await tx.insert(stateChanges).values(newStateChanges.map(toStateChangeRow))
      }
    })
  }

  async findMany(query: ListQuery): Promise<Page<Contact>> {
    const where = combineWhere([
      isNull(contacts.deletedAt),
      ...applyFilterSet(contactColumnMap, query.filters),
      applySearch(contactSearchCols, query.search),
    ])

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(contacts)
        .where(where),
      this.db
        .select()
        .from(contacts)
        .where(where)
        .orderBy(desc(contacts.createdAt))
        .limit(query.pagination.limit)
        .offset(query.pagination.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items = rows.map((row) => reconstitute(row, [], []))

    return { items, total, limit: query.pagination.limit, offset: query.pagination.offset }
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
