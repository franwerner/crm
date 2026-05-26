import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { ChannelType } from '@modules/contacts/domain/types/channel-type'
import { NotFoundError } from '@shared/errors'
import { newId } from '@shared/utils/id'

export interface AddContactChannelInput {
  contactId: string
  channelType: ChannelType
  value: string
  isPrimary?: boolean
}

export class ContactAddChannelUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: AddContactChannelInput): Promise<Contact> {
    const contact = await this.repo.findById(input.contactId)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.contactId} not found`)
    }

    const now = new Date()
    const channel = {
      id: newId(),
      contactId: input.contactId,
      channelType: input.channelType,
      value: input.value,
      isPrimary: input.isPrimary ?? false,
      createdAt: now,
      updatedAt: now,
    }

    const updated = contact.addChannel(channel)

    await this.repo.addChannel(updated, channel)
    return updated
  }
}
