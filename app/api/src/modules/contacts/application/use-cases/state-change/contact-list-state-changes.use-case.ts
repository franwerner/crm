import type { ContactStateChange } from '@modules/contacts/domain/entities/contact-state-change'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { Page, PageParams } from '@shared/types/pagination'
import { NotFoundError } from '@shared/errors'

export interface ListContactStateChangesInput extends PageParams {
  contactId: string
}

export class ContactListStateChangesUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: ListContactStateChangesInput): Promise<Page<ContactStateChange>> {
    const contact = await this.repo.findById(input.contactId)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.contactId} not found`)
    }
    return this.repo.findStateChanges(input.contactId, { limit: input.limit, offset: input.offset })
  }
}
