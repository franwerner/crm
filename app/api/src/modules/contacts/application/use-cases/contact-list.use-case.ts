import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { Page, PageParams } from '@shared/types/pagination'

export interface ListContactsInput extends PageParams {}

export interface ListContactsDeps {
  repo: ContactsRepository
}

export async function listContacts(input: ListContactsInput, deps: ListContactsDeps): Promise<Page<Contact>> {
  return deps.repo.findMany(input)
}
