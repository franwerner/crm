import { asc, desc, isNull, sql, type AnyColumn } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { contacts, users } from '@shared/db/schema'
import { applyFilterGroups, applySearch, combineWhere } from '@shared/db/drizzle-filters'
import { contactColumnMap, contactSearchCols } from '@modules/contacts/infrastructure/contact.resource'
import type { ContactQueries, ContactListInput, ContactListItem, ContactCreatorRef } from '@modules/contacts/application/contact.query'
import type { Page } from '@shared/types/pagination'
import type { PipelineState } from '@modules/contacts/domain/types/pipeline-state'
import type { SourceChannel } from '@modules/contacts/domain/types/source-channel'
import type { InterestLevel } from '@modules/contacts/domain/types/interest-level'

export class DrizzleContactQueries implements ContactQueries {
  constructor(private readonly db: Db) {}

  async list(input: ContactListInput): Promise<Page<ContactListItem>> {
    const where = combineWhere([
      isNull(contacts.deletedAt),
      applyFilterGroups(contactColumnMap, input.filterGroups),
      applySearch(contactSearchCols, input.search),
    ])

    const sortableMap = contactColumnMap as Record<string, AnyColumn>
    const sortCol = input.sort ? sortableMap[input.sort.field] : undefined
    const orderExpr = sortCol
      ? input.sort!.dir === 'asc'
        ? asc(sortCol)
        : desc(sortCol)
      : desc(contacts.createdAt)

    if (input.populated) {
      const [countResult, rows] = await Promise.all([
        this.db
          .select({ count: sql<string>`count(*)` })
          .from(contacts)
          .where(where),
        this.db
          .select({
            id: contacts.id,
            name: contacts.name,
            phone: contacts.phone,
            pipelineState: contacts.pipelineState,
            stateLocked: contacts.stateLocked,
            sourceChannel: contacts.sourceChannel,
            interestLevel: contacts.interestLevel,
            createdBy: contacts.createdBy,
            createdAt: contacts.createdAt,
            updatedAt: contacts.updatedAt,
            creatorId: users.id,
            creatorName: users.name,
          })
          .from(contacts)
          .leftJoin(users, sql`${contacts.createdBy} = ${users.id}`)
          .where(where)
          .orderBy(orderExpr)
          .limit(input.pagination.limit)
          .offset(input.pagination.offset),
      ])

      const total = Number(countResult[0]?.count ?? 0)
      const items: ContactListItem[] = rows.map((row) => {
        const creator: ContactCreatorRef | null =
          row.creatorId !== null && row.creatorName !== null
            ? { id: row.creatorId, name: row.creatorName }
            : null
        return {
          id: row.id,
          name: row.name,
          phone: row.phone,
          pipelineState: row.pipelineState as PipelineState,
          stateLocked: row.stateLocked,
          sourceChannel: row.sourceChannel as SourceChannel | null,
          interestLevel: row.interestLevel as InterestLevel | null,
          createdBy: row.createdBy,
          creator,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }
      })

      return { items, total, limit: input.pagination.limit, offset: input.pagination.offset }
    }

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(contacts)
        .where(where),
      this.db
        .select()
        .from(contacts)
        .where(where)
        .orderBy(orderExpr)
        .limit(input.pagination.limit)
        .offset(input.pagination.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items: ContactListItem[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      pipelineState: row.pipelineState as PipelineState,
      stateLocked: row.stateLocked,
      sourceChannel: row.sourceChannel as SourceChannel | null,
      interestLevel: row.interestLevel as InterestLevel | null,
      createdBy: row.createdBy,
      creator: null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))

    return { items, total, limit: input.pagination.limit, offset: input.pagination.offset }
  }
}
