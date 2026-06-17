// Drizzle adapter — Drizzle ONLY inside this file (layers/hexagonal contract).
import type { Db, DrizzleTx } from '@shared/db/client'
import { contacts as contactsTable, contactChannels } from '@shared/db/schema'
import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactBulkRepository } from '@modules/contacts/domain/contact-bulk.repository'
import { toContactRow } from './contact-core.repo-part'
import { toChannelRow } from './contact-channel.repo-part'

export class DrizzleContactBulkRepository implements ContactBulkRepository {
  constructor(private readonly db: Db) {}

  async createMany(contacts: Contact[], tx?: unknown): Promise<void> {
    if (contacts.length === 0) return

    const contactRows = contacts.map(toContactRow)
    const channelRows = contacts.flatMap((c) => c.channels.map(toChannelRow))

    // Cast to DrizzleTx — callers that pass a UoW transaction always supply a DrizzleTx.
    // The port accepts `unknown` to avoid importing DB types at the domain boundary.
    const drizzleTx = tx as DrizzleTx | undefined

    if (drizzleTx) {
      // Caller owns the transaction (UoW path); run inside it.
      await drizzleTx.insert(contactsTable).values(contactRows)
      if (channelRows.length > 0) {
        await drizzleTx.insert(contactChannels).values(channelRows)
      }
    } else {
      // Self-managed transaction when no UoW is active.
      await this.db.transaction(async (innerTx) => {
        await innerTx.insert(contactsTable).values(contactRows)
        if (channelRows.length > 0) {
          await innerTx.insert(contactChannels).values(channelRows)
        }
      })
    }
  }
}
