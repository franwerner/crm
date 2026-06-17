import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { ChannelType } from '@modules/contacts/domain/types/channel-type'
import type { ChannelChecker } from '@shared/verification/channel-checker'
import { NotFoundError } from '@shared/errors'

export interface UpdateContactChannelInput {
  contactId: string
  channelId: string
  channelType?: ChannelType
  value?: string
  isPrimary?: boolean
}

export class ContactUpdateChannelUseCase {
  constructor(
    private readonly repo: ContactsRepository,
    private readonly checker: ChannelChecker,
  ) {}

  async execute(input: UpdateContactChannelInput): Promise<Contact> {
    const contact = await this.repo.findById(input.contactId)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.contactId} not found`)
    }

    const now = new Date()

    // Determine the effective value and type after the update for verification.
    const existingChannel = contact.channels.find((ch) => ch.id === input.channelId)
    const effectiveType = input.channelType ?? existingChannel?.channelType
    const effectiveValue = input.value ?? existingChannel?.value

    const checkerType =
      effectiveType === 'Email'
        ? 'email'
        : effectiveType === 'Phone'
          ? 'phone'
          : null

    // Re-run verification whenever value or type changes; a failure does not abort (R8.5).
    let verificationStatus: 'valid' | 'invalid' | 'unverified' | undefined
    let verifiedAt: Date | null | undefined
    let verificationDetail: object | null | undefined

    if (checkerType !== null && effectiveValue !== undefined) {
      const result = await this.checker.verify(checkerType, effectiveValue).catch((err) => ({
        status: 'unverified' as const,
        verifiedAt: now,
        detail: { reason: 'checker_error', message: err instanceof Error ? err.message : String(err) },
      }))
      verificationStatus = result.status
      verifiedAt = result.verifiedAt
      verificationDetail = result.detail
    }

    const updated = contact.updateChannel(
      input.channelId,
      {
        channelType: input.channelType,
        value: input.value,
        isPrimary: input.isPrimary,
        verificationStatus,
        verifiedAt,
        verificationDetail,
      },
      now,
    )

    await this.repo.updateChannel(updated, input.channelId)
    return updated
  }
}
