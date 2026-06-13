import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import { NotFoundError } from '@shared/errors'

export interface RemoveContactChannelInput {
  contactId: string
  channelId: string
}

export class ContactRemoveChannelUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: RemoveContactChannelInput): Promise<Contact> {
    const contact = await this.repo.findById(input.contactId)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.contactId} not found`)
    }

    const updated = contact.removeChannel(input.channelId, new Date())

    await this.repo.removeChannel(updated, input.channelId)
    return updated
  }
}
