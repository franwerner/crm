import type { Contact } from '../../domain/contact'
import type { ContactsRepository } from '../../domain/contact.repository'
import { NotFoundError } from '../../../../shared/errors'

export interface GetContactInput {
  id: string
}

export interface GetContactDeps {
  repo: ContactsRepository
}

export async function getContact(input: GetContactInput, deps: GetContactDeps): Promise<Contact> {
  const contact = await deps.repo.findById(input.id)
  if (!contact) {
    throw new NotFoundError(`Contact ${input.id} not found`)
  }
  return contact
}
