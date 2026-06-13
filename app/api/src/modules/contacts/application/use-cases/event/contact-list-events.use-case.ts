import type { ContactEvent } from '@modules/contacts/domain/entities/contact-event'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { Page, PageParams } from '@shared/types/pagination'
import { NotFoundError } from '@shared/errors'

export interface ListContactEventsInput extends PageParams {
  contactId: string
}

export class ContactListEventsUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: ListContactEventsInput): Promise<Page<ContactEvent>> {
    const contact = await this.repo.findById(input.contactId)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.contactId} not found`)
    }
    return this.repo.findEvents(input.contactId, { limit: input.limit, offset: input.offset })
  }
}
