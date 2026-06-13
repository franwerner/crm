import { desc, eq, sql } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { events } from '@shared/db/schema'
import type { ContactEvent } from '@modules/contacts/domain/entities/contact-event'
import type { EventType } from '@modules/contacts/domain/types/event-type'
import type { Page, PageParams } from '@shared/types/pagination'

type EventRow = typeof events.$inferSelect

export function toContactEvent(row: EventRow): ContactEvent {
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

export function toEventRow(e: ContactEvent): typeof events.$inferInsert {
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

export class ContactEventRepoPart {
  constructor(private readonly db: Db) {}

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
}
