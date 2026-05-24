import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import { NotFoundError } from '@shared/errors'

export interface GetContactInput {
  id: string
}

export class ContactGetUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: GetContactInput): Promise<Contact> {
    const contact = await this.repo.findById(input.id)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.id} not found`)
    }
    return contact
  }
}
