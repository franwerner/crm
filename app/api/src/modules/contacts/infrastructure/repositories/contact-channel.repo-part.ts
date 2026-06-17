import { and, eq, ne } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { contactChannels, contacts } from '@shared/db/schema'
import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactChannel } from '@modules/contacts/domain/entities/contact-channel'
import type { ChannelType } from '@modules/contacts/domain/types/channel-type'
import type { ChannelVerificationStatus } from '@modules/contacts/domain/types/channel-verification-status'

type ContactChannelRow = typeof contactChannels.$inferSelect

export function toContactChannel(row: ContactChannelRow): ContactChannel {
  return {
    id: row.id,
    contactId: row.contactId,
    channelType: row.channelType as ChannelType,
    value: row.value,
    isPrimary: row.isPrimary,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    // Verification fields (R8.1); rows inserted before migration default to 'unverified'.
    verificationStatus: row.verificationStatus as ChannelVerificationStatus,
    verifiedAt: row.verifiedAt ?? null,
    verificationDetail: (row.verificationDetail as object | null) ?? null,
  }
}

export function toChannelRow(ch: ContactChannel): typeof contactChannels.$inferInsert {
  return {
    id: ch.id,
    contactId: ch.contactId,
    channelType: ch.channelType,
    value: ch.value,
    isPrimary: ch.isPrimary,
    createdAt: ch.createdAt,
    updatedAt: ch.updatedAt,
    verificationStatus: ch.verificationStatus,
    verifiedAt: ch.verifiedAt ?? undefined,
    verificationDetail: ch.verificationDetail ?? undefined,
  }
}

export class ContactChannelRepoPart {
  constructor(private readonly db: Db) {}

  async addChannel(contact: Contact, channel: ContactChannel): Promise<void> {
    await this.db.transaction(async (tx) => {
      if (channel.isPrimary) {
        await tx
          .update(contactChannels)
          .set({ isPrimary: false })
          .where(eq(contactChannels.contactId, contact.id))
      }
      await tx.insert(contactChannels).values(toChannelRow(channel))
      await tx
        .update(contacts)
        .set({ updatedAt: contact.updatedAt })
        .where(eq(contacts.id, contact.id))
    })
  }

  async updateChannel(contact: Contact, channelId: string): Promise<void> {
    const channel = contact.channels.find((ch) => ch.id === channelId)
    if (!channel) return

    await this.db.transaction(async (tx) => {
      if (channel.isPrimary) {
        await tx
          .update(contactChannels)
          .set({ isPrimary: false })
          .where(and(eq(contactChannels.contactId, contact.id), ne(contactChannels.id, channelId)))
      }
      await tx
        .update(contactChannels)
        .set({
          channelType: channel.channelType,
          value: channel.value,
          isPrimary: channel.isPrimary,
          updatedAt: channel.updatedAt,
          // Persist verification fields so a checker result from the use-case is saved (R8.4).
          verificationStatus: channel.verificationStatus,
          verifiedAt: channel.verifiedAt ?? undefined,
          verificationDetail: channel.verificationDetail ?? undefined,
        })
        .where(eq(contactChannels.id, channelId))
      await tx
        .update(contacts)
        .set({ updatedAt: contact.updatedAt })
        .where(eq(contacts.id, contact.id))
    })
  }

  async removeChannel(contact: Contact, channelId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(contactChannels).where(eq(contactChannels.id, channelId))
      await tx
        .update(contacts)
        .set({ updatedAt: contact.updatedAt })
        .where(eq(contacts.id, contact.id))
    })
  }
}
