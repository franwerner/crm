import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'

export interface BulkDeleteContactsInput {
  ids: string[]
}

export class ContactBulkDeleteUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: BulkDeleteContactsInput): Promise<void> {
    await this.repo.softDeleteMany(input.ids, new Date())
  }
}
