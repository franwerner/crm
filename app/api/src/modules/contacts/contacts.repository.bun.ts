import { eq } from 'drizzle-orm'
import type { Db } from '../../shared/db/client'
import { contacts, events, stateChanges } from '../../shared/db/schema'
import { Contact } from './contact'
import type { PipelineState } from './types/pipeline-state'
import type { EventType } from './types/event-type'
import type { SourceChannel } from './types/source-channel'
import type { InterestLevel } from './types/interest-level'
import type { StateChangeCause } from './types/state-change-cause'
import type { ContactEvent } from './entities/contact-event'
import type { ContactStateChange } from './entities/contact-state-change'
import type { ContactsRepository } from './contacts.repository'

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

export class DrizzleContactsRepository implements ContactsRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<Contact | null> {
    const contactRow = await this.db.query.contacts.findFirst({
      where: eq(contacts.id, id),
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
      await tx
        .insert(contacts)
        .values({
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
        })
        .onConflictDoUpdate({
          target: contacts.id,
          set: {
            name: contact.name,
            handle: contact.handle,
            phone: contact.phone,
            pipeline_state: contact.pipelineState,
            state_locked: contact.stateLocked,
            source_channel: contact.sourceChannel,
            interest_level: contact.interestLevel,
            updated_at: contact.updatedAt,
            deleted_at: contact.deletedAt,
          },
        })

      if (newEvents.length > 0) {
        await tx.insert(events).values(
          newEvents.map((e) => ({
            id: e.id,
            contact_id: e.contactId,
            author_id: e.authorId,
            event_type: e.eventType,
            detail: e.detail,
            occurred_at: e.occurredAt,
            created_at: e.createdAt,
          })),
        )
      }

      if (newStateChanges.length > 0) {
        await tx.insert(stateChanges).values(
          newStateChanges.map((sc) => ({
            id: sc.id,
            contact_id: sc.contactId,
            previous_state: sc.previousState,
            next_state: sc.nextState,
            caused_by_event_id: sc.cause.kind === 'event' ? sc.cause.eventId : null,
            caused_by_user_id: sc.cause.kind === 'manual' ? sc.cause.userId : null,
            changed_at: sc.changedAt,
            created_at: sc.createdAt,
          })),
        )
      }
    })
  }
}
