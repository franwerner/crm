import { asc, and, desc, eq, gte, isNull, lt, sql, type AnyColumn } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { contacts, contactChannels, contactAssignments, stateChanges, users } from '@shared/db/schema'
import { applyFilterGroups, applySearch, combineWhere } from '@shared/db/drizzle-filters'
import { contactColumnMap, contactSearchCols } from '@modules/contacts/infrastructure/contact.resource'
import type { ContactQueries, ContactListInput, ContactListItem, ContactCreatorRef, ContactKpisResult, ContactPrimaryChannel, ContactAssignmentListItem } from '@modules/contacts/application/contact.query'
import type { Page, PageParams } from '@shared/types/pagination'
import type { PipelineState } from '@modules/contacts/domain/types/pipeline-state'
import type { SourceChannel } from '@modules/contacts/domain/types/source-channel'
import type { InterestLevel } from '@modules/contacts/domain/types/interest-level'
import type { ContactType } from '@modules/contacts/domain/types/contact-type'
import type { Sex } from '@modules/contacts/domain/types/sex'
import type { ChannelType } from '@modules/contacts/domain/types/channel-type'
import type { ContactAssignmentRole } from '@modules/contacts/domain/types/contact-assignment-role'

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

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(contacts)
        .where(where),
      this.db
        .select({
          id: contacts.id,
          name: contacts.name,
          contactType: contacts.contactType,
          sex: contacts.sex,
          notes: contacts.notes,
          pipelineState: contacts.pipelineState,
          sourceChannel: contacts.sourceChannel,
          interestLevel: contacts.interestLevel,
          createdBy: contacts.createdBy,
          createdAt: contacts.createdAt,
          updatedAt: contacts.updatedAt,
          creatorId: users.id,
          creatorName: users.name,
          primaryChannelType: contactChannels.channelType,
          primaryChannelValue: contactChannels.value,
        })
        .from(contacts)
        .leftJoin(users, sql`${contacts.createdBy} = ${users.id}`)
        .leftJoin(
          contactChannels,
          and(
            eq(contactChannels.contactId, contacts.id),
            eq(contactChannels.isPrimary, true),
          ),
        )
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

      const primaryChannel: ContactPrimaryChannel | null =
        row.primaryChannelType !== null && row.primaryChannelValue !== null
          ? { channelType: row.primaryChannelType as ChannelType, value: row.primaryChannelValue }
          : null

      return {
        id: row.id,
        name: row.name,
        contactType: row.contactType as ContactType,
        sex: row.sex as Sex | null,
        notes: row.notes,
        pipelineState: row.pipelineState as PipelineState,
        sourceChannel: row.sourceChannel as SourceChannel | null,
        interestLevel: row.interestLevel as InterestLevel | null,
        createdBy: row.createdBy,
        creator,
        primaryChannel,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }
    })

    return { items, total, limit: input.pagination.limit, offset: input.pagination.offset }
  }

  async listAssignments(contactId: string, params: PageParams): Promise<Page<ContactAssignmentListItem>> {
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(contactAssignments)
        .where(eq(contactAssignments.contactId, contactId)),
      this.db
        .select({
          userId: contactAssignments.userId,
          userName: users.name,
          role: contactAssignments.role,
          assignedBy: contactAssignments.assignedBy,
          assignedAt: contactAssignments.assignedAt,
        })
        .from(contactAssignments)
        .innerJoin(users, eq(users.id, contactAssignments.userId))
        .where(eq(contactAssignments.contactId, contactId))
        .orderBy(asc(contactAssignments.assignedAt))
        .limit(params.limit)
        .offset(params.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items: ContactAssignmentListItem[] = rows.map((row) => ({
      userId: row.userId,
      userName: row.userName,
      role: row.role as ContactAssignmentRole,
      assignedBy: row.assignedBy,
      assignedAt: row.assignedAt,
    }))

    return { items, total, limit: params.limit, offset: params.offset }
  }

  async findCreatorRef(userId: string): Promise<ContactCreatorRef | null> {
    const rows = await this.db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    const row = rows[0]
    return row ? { id: row.id, name: row.name } : null
  }

  async kpis(): Promise<ContactKpisResult> {
    const now = new Date()
    const minus30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const minus60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const [
      contactCurrent,
      contactPrevious,
      leadCurrent,
      leadPrevious,
      customerCurrent,
      customerPrevious,
      discardedCurrent,
      discardedPrevious,
      totalStock,
    ] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(contacts)
        .where(and(isNull(contacts.deletedAt), gte(contacts.createdAt, minus30), lt(contacts.createdAt, now))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(contacts)
        .where(and(isNull(contacts.deletedAt), gte(contacts.createdAt, minus60), lt(contacts.createdAt, minus30))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(stateChanges)
        .innerJoin(contacts, and(sql`${stateChanges.contactId} = ${contacts.id}`, isNull(contacts.deletedAt)))
        .where(and(sql`${stateChanges.nextState} = 'Lead'`, gte(stateChanges.changedAt, minus30), lt(stateChanges.changedAt, now))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(stateChanges)
        .innerJoin(contacts, and(sql`${stateChanges.contactId} = ${contacts.id}`, isNull(contacts.deletedAt)))
        .where(and(sql`${stateChanges.nextState} = 'Lead'`, gte(stateChanges.changedAt, minus60), lt(stateChanges.changedAt, minus30))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(stateChanges)
        .innerJoin(contacts, and(sql`${stateChanges.contactId} = ${contacts.id}`, isNull(contacts.deletedAt)))
        .where(and(sql`${stateChanges.nextState} = 'Customer'`, gte(stateChanges.changedAt, minus30), lt(stateChanges.changedAt, now))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(stateChanges)
        .innerJoin(contacts, and(sql`${stateChanges.contactId} = ${contacts.id}`, isNull(contacts.deletedAt)))
        .where(and(sql`${stateChanges.nextState} = 'Customer'`, gte(stateChanges.changedAt, minus60), lt(stateChanges.changedAt, minus30))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(stateChanges)
        .innerJoin(contacts, and(sql`${stateChanges.contactId} = ${contacts.id}`, isNull(contacts.deletedAt)))
        .where(and(sql`${stateChanges.nextState} = 'Discarded'`, gte(stateChanges.changedAt, minus30), lt(stateChanges.changedAt, now))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(stateChanges)
        .innerJoin(contacts, and(sql`${stateChanges.contactId} = ${contacts.id}`, isNull(contacts.deletedAt)))
        .where(and(sql`${stateChanges.nextState} = 'Discarded'`, gte(stateChanges.changedAt, minus60), lt(stateChanges.changedAt, minus30))),
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(contacts)
        .where(isNull(contacts.deletedAt)),
    ])

    return {
      total: {
        count: Number(totalStock[0]?.count ?? 0),
        current: Number(contactCurrent[0]?.count ?? 0),
        previous: Number(contactPrevious[0]?.count ?? 0),
      },
      states: [
        { state: 'Contact', current: Number(contactCurrent[0]?.count ?? 0), previous: Number(contactPrevious[0]?.count ?? 0) },
        { state: 'Lead', current: Number(leadCurrent[0]?.count ?? 0), previous: Number(leadPrevious[0]?.count ?? 0) },
        { state: 'Customer', current: Number(customerCurrent[0]?.count ?? 0), previous: Number(customerPrevious[0]?.count ?? 0) },
        { state: 'Discarded', current: Number(discardedCurrent[0]?.count ?? 0), previous: Number(discardedPrevious[0]?.count ?? 0) },
      ],
    }
  }
}
