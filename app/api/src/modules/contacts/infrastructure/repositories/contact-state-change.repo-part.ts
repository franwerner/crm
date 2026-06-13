import { desc, eq, sql } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { stateChanges } from '@shared/db/schema'
import type { ContactStateChange } from '@modules/contacts/domain/entities/contact-state-change'
import type { PipelineState } from '@modules/contacts/domain/types/pipeline-state'
import type { StateChangeCause } from '@modules/contacts/domain/types/state-change-cause'
import type { Page, PageParams } from '@shared/types/pagination'

type StateChangeRow = typeof stateChanges.$inferSelect

export function toStateChangeCause(row: StateChangeRow): StateChangeCause {
  return { kind: 'event', eventId: row.causedByEventId ?? '' }
}

export function toContactStateChange(row: StateChangeRow): ContactStateChange {
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

export function toStateChangeRow(sc: ContactStateChange): typeof stateChanges.$inferInsert {
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

export class ContactStateChangeRepoPart {
  constructor(private readonly db: Db) {}

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
