import type { ChannelType } from '@modules/contacts/domain/types/channel-type'

export interface ContactChannel {
  readonly id: string
  readonly contactId: string
  readonly channelType: ChannelType
  readonly value: string
  readonly isPrimary: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
}
