import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { ChannelType } from '@modules/contacts/domain/types/channel-type'
import type { ChannelChecker } from '@shared/verification/channel-checker'
import { NotFoundError } from '@shared/errors'
import { newId } from '@shared/utils/id'

export interface AddContactChannelInput {
  contactId: string
  channelType: ChannelType
  value: string
  isPrimary?: boolean
}

export class ContactAddChannelUseCase {
  constructor(
    private readonly repo: ContactsRepository,
    private readonly checker: ChannelChecker,
  ) {}

  async execute(input: AddContactChannelInput): Promise<Contact> {
    const contact = await this.repo.findById(input.contactId)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.contactId} not found`)
    }

    const now = new Date()

    // Only Email and Phone channels are verifiable; others are stored as unverified.
    const checkerType =
      input.channelType === 'Email'
        ? 'email'
        : input.channelType === 'Phone'
          ? 'phone'
          : null

    // A checker error must not abort the operation — channel is saved as unverified (R8.5).
    let verificationStatus: 'valid' | 'invalid' | 'unverified' = 'unverified'
    let verifiedAt: Date | null = null
    let verificationDetail: object | null = null

    if (checkerType !== null) {
      const result = await this.checker.verify(checkerType, input.value).catch((err) => ({
        status: 'unverified' as const,
        verifiedAt: now,
        detail: { reason: 'checker_error', message: err instanceof Error ? err.message : String(err) },
      }))
      verificationStatus = result.status
      verifiedAt = result.verifiedAt
      verificationDetail = result.detail
    }

    const channel = {
      id: newId(),
      contactId: input.contactId,
      channelType: input.channelType,
      value: input.value,
      isPrimary: input.isPrimary ?? false,
      createdAt: now,
      updatedAt: now,
      verificationStatus,
      verifiedAt,
      verificationDetail,
    }

    const updated = contact.addChannel(channel)

    await this.repo.addChannel(updated, channel)
    return updated
  }
}
