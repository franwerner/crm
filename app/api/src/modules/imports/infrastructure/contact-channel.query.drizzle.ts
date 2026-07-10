// Drizzle adapter — queries contact_channels via shared schema only.
// Never imports from src/modules/contacts (EDR layers, slice-isolation).
import { eq, or } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { contactChannels } from '@shared/db/schema'
import type { ContactChannelLookup } from '@modules/imports/application/contact-channel.query'

export class DrizzleContactChannelLookup implements ContactChannelLookup {
  constructor(private readonly db: Db) {}

  async existsByEmailOrPhone(email?: string, phone?: string): Promise<boolean> {
    if (!email && !phone) return false

    // OR semantics: a row with either the email OR the phone is a duplicate (R4.1).
    const conditions = []
    if (email) {
      conditions.push(eq(contactChannels.value, email))
    }
    if (phone) {
      conditions.push(eq(contactChannels.value, phone))
    }

    const rows = await this.db
      .select({ id: contactChannels.id })
      .from(contactChannels)
      .where(conditions.length === 1 ? conditions[0]! : or(...conditions))
      .limit(1)

    return rows.length > 0
  }
}
