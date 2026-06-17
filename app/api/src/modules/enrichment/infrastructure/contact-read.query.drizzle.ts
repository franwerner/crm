// Drizzle adapter — queries contacts and contact_channels via shared schema only.
// Never imports from src/modules/contacts (ADR layers, slice-isolation).
import { eq, isNull, getTableColumns } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { contacts, contactChannels } from '@shared/db/schema'
import { applyFilterGroups, applySearch, combineWhere } from '@shared/db/drizzle-filters'
import type { ContactReadQuery, ContactReadDto, ContactFilterInput } from '@modules/enrichment/application/ports'

// Column map built locally from @shared/db — never imported from @modules/contacts
// (ADR cross-slice-id-resolution, rule: obtain columns with getTableColumns locally).
const contactColumnMap = getTableColumns(contacts)

// Search columns mirrored from contacts list: name only.
const contactSearchCols = [contacts.name]

export class DrizzleContactReadQuery implements ContactReadQuery {
  constructor(private readonly db: Db) {}

  async findById(contactId: string): Promise<ContactReadDto | null> {
    const contactRows = await this.db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1)

    const contactRow = contactRows[0]
    if (!contactRow) return null

    const channelRows = await this.db
      .select()
      .from(contactChannels)
      .where(eq(contactChannels.contactId, contactId))

    return {
      id: contactRow.id,
      name: contactRow.name,
      notes: contactRow.notes,
      addressCity: contactRow.addressCity,
      addressCountry: contactRow.addressCountry,
      channels: channelRows.map((ch) => ({
        channelType: ch.channelType,
        value: ch.value,
        isPrimary: ch.isPrimary,
      })),
    }
  }

  /**
   * Resolves the IDs of contacts that match the given DNF filter + search term,
   * reusing the same grammar as the contacts list endpoint.
   *
   * Soft-delete guard (isNull deletedAt) is always applied OUTSIDE the OR groups,
   * per ADR filter-grammar.md §Invariante de soft-delete.
   * Never resolves deleted contacts regardless of what the filter says.
   */
  async resolveByFilter(input: ContactFilterInput): Promise<string[]> {
    const where = combineWhere([
      isNull(contacts.deletedAt),
      applyFilterGroups(contactColumnMap, input.filterGroups),
      applySearch(contactSearchCols, input.search),
    ])

    const rows = await this.db
      .select({ id: contacts.id })
      .from(contacts)
      .where(where)

    return rows.map((r) => r.id)
  }
}
