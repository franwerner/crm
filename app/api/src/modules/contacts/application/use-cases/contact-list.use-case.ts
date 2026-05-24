import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { ListQuery } from '@shared/types/filters'
import type { Page } from '@shared/types/pagination'

export interface ListContactsInput extends ListQuery {}

export class ContactListUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: ListContactsInput): Promise<Page<Contact>> {
    return this.repo.findMany(input)
  }
}
