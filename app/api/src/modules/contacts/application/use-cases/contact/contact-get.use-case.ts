import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { ContactCreatorRef, ContactQueries } from '@modules/contacts/application/contact.query'
import { NotFoundError } from '@shared/errors'

export interface GetContactInput {
  id: string
}

export interface GetContactResult {
  contact: Contact
  creator: ContactCreatorRef | null
}

export class ContactGetUseCase {
  constructor(
    private readonly repo: ContactsRepository,
    private readonly queries: ContactQueries,
  ) {}

  async execute(input: GetContactInput): Promise<GetContactResult> {
    const contact = await this.repo.findById(input.id)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.id} not found`)
    }
    const creator = await this.queries.findCreatorRef(contact.createdBy)
    return { contact, creator }
  }
}
