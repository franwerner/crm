// Drizzle adapter — queries contacts and contact_channels via shared schema only.
// Never imports from src/modules/contacts (ADR layers, slice-isolation).
import { eq } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { contacts, contactChannels } from '@shared/db/schema'
import type { ContactReadQuery, ContactReadDto } from '@modules/enrichment/application/ports'

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
}
