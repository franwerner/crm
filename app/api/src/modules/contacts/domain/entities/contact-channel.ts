import type { ChannelType } from '@modules/contacts/domain/types/channel-type'
import type { ChannelVerificationStatus } from '@modules/contacts/domain/types/channel-verification-status'

export interface ContactChannel {
  readonly id: string
  readonly contactId: string
  readonly channelType: ChannelType
  readonly value: string
  readonly isPrimary: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
  // Verification fields added for Fase 1 (R8.1); default to unverified for pre-existing channels.
  readonly verificationStatus: ChannelVerificationStatus
  readonly verifiedAt: Date | null
  readonly verificationDetail: object | null
}
