import type { ContactQueries, ContactListInput, ContactListItem } from '@modules/contacts/application/contact.query'
import type { Page } from '@shared/types/pagination'

export class ContactListUseCase {
  constructor(private readonly queries: ContactQueries) {}

  async execute(input: ContactListInput): Promise<Page<ContactListItem>> {
    return this.queries.list(input)
  }
}
