import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { ChannelType } from '@modules/contacts/domain/types/channel-type'
import { NotFoundError } from '@shared/errors'

export interface UpdateContactChannelInput {
  contactId: string
  channelId: string
  channelType?: ChannelType
  value?: string
  isPrimary?: boolean
}

export class ContactUpdateChannelUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: UpdateContactChannelInput): Promise<Contact> {
    const contact = await this.repo.findById(input.contactId)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.contactId} not found`)
    }

    const updated = contact.updateChannel(
      input.channelId,
      {
        channelType: input.channelType,
        value: input.value,
        isPrimary: input.isPrimary,
      },
      new Date(),
    )

    await this.repo.updateChannel(updated, input.channelId)
    return updated
  }
}
