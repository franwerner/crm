import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import type { Db } from '../../../shared/db/client'
import { contacts, events, stateChanges } from '../../../shared/db/schema'
import { Contact } from '../domain/contact'
import type { PipelineState } from '../domain/types/pipeline-state'
import type { EventType } from '../domain/types/event-type'
import type { SourceChannel } from '../domain/types/source-channel'
import type { InterestLevel } from '../domain/types/interest-level'
import type { StateChangeCause } from '../domain/types/state-change-cause'
import type { ContactEvent } from '../domain/entities/contact-event'
import type { ContactStateChange } from '../domain/entities/contact-state-change'
import type { ContactsRepository } from '../domain/contact.repository'
import type { Page, PageParams } from '../../../shared/types/pagination'

type ContactRow = typeof contacts.$inferSelect
type EventRow = typeof events.$inferSelect
type StateChangeRow = typeof stateChanges.$inferSelect

function toContactEvent(row: EventRow): ContactEvent {
  return {
    id: row.id,
    contactId: row.contact_id,
    authorId: row.author_id,
    eventType: row.event_type as EventType,
    detail: row.detail,
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  }
}

function toStateChangeCause(row: StateChangeRow): StateChangeCause {
  if (row.caused_by_event_id !== null) {
    return { kind: 'event', eventId: row.caused_by_event_id }
  }
  if (row.caused_by_user_id !== null) {
    return { kind: 'manual', userId: row.caused_by_user_id }
  }
  return { kind: 'manual', userId: '' }
}

function toContactStateChange(row: StateChangeRow): ContactStateChange {
  return {
    id: row.id,
    contactId: row.contact_id,
    previousState: row.previous_state as PipelineState,
    nextState: row.next_state as PipelineState,
    cause: toStateChangeCause(row),
    changedAt: row.changed_at,
    createdAt: row.created_at,
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
    pipelineState: contactRow.pipeline_state as PipelineState,
    stateLocked: contactRow.state_locked,
    sourceChannel: contactRow.source_channel as SourceChannel | null,
    interestLevel: contactRow.interest_level as InterestLevel | null,
    createdBy: contactRow.created_by,
    createdAt: contactRow.created_at,
    updatedAt: contactRow.updated_at,
    deletedAt: contactRow.deleted_at,
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
    pipeline_state: contact.pipelineState,
    state_locked: contact.stateLocked,
    source_channel: contact.sourceChannel,
    interest_level: contact.interestLevel,
    created_by: contact.createdBy,
    created_at: contact.createdAt,
    updated_at: contact.updatedAt,
    deleted_at: contact.deletedAt,
  }
}

function toEventRow(e: ContactEvent): typeof events.$inferInsert {
  return {
    id: e.id,
    contact_id: e.contactId,
    author_id: e.authorId,
    event_type: e.eventType,
    detail: e.detail,
    occurred_at: e.occurredAt,
    created_at: e.createdAt,
  }
}

function toStateChangeRow(sc: ContactStateChange): typeof stateChanges.$inferInsert {
  return {
    id: sc.id,
    contact_id: sc.contactId,
    previous_state: sc.previousState,
    next_state: sc.nextState,
    caused_by_event_id: sc.cause.kind === 'event' ? sc.cause.eventId : null,
    caused_by_user_id: sc.cause.kind === 'manual' ? sc.cause.userId : null,
    changed_at: sc.changedAt,
    created_at: sc.createdAt,
  }
}

export class DrizzleContactsRepository implements ContactsRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<Contact | null> {
    const contactRow = await this.db.query.contacts.findFirst({
      where: and(eq(contacts.id, id), isNull(contacts.deleted_at)),
    })

    if (!contactRow) return null

    const eventRows = await this.db.query.events.findMany({
      where: eq(events.contact_id, id),
    })

    const stateChangeRows = await this.db.query.stateChanges.findMany({
      where: eq(stateChanges.contact_id, id),
    })

    return reconstitute(contactRow, eventRows, stateChangeRows)
  }

  async save(contact: Contact): Promise<void> {
    const newEvents = contact.newEvents
    const newStateChanges = contact.newStateChanges

    await this.db.transaction(async (tx) => {
      const contactInsert = toContactRow(contact)
      const { id: _id, created_at: _ca, created_by: _cb, ...updateSet } = contactInsert

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

  async findMany(params: PageParams): Promise<Page<Contact>> {
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(contacts)
        .where(isNull(contacts.deleted_at)),
      this.db
        .select()
        .from(contacts)
        .where(isNull(contacts.deleted_at))
        .orderBy(desc(contacts.created_at))
        .limit(params.limit)
        .offset(params.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items = rows.map((row) => reconstitute(row, [], []))

    return { items, total, limit: params.limit, offset: params.offset }
  }

  async findEvents(contactId: string, params: PageParams): Promise<Page<ContactEvent>> {
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(events)
        .where(eq(events.contact_id, contactId)),
      this.db
        .select()
        .from(events)
        .where(eq(events.contact_id, contactId))
        .orderBy(desc(events.occurred_at))
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
        .where(eq(stateChanges.contact_id, contactId)),
      this.db
        .select()
        .from(stateChanges)
        .where(eq(stateChanges.contact_id, contactId))
        .orderBy(desc(stateChanges.changed_at))
        .limit(params.limit)
        .offset(params.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items = rows.map(toContactStateChange)

    return { items, total, limit: params.limit, offset: params.offset }
  }
}
