import type { ContactStateChange } from '../../domain/entities/contact-state-change'
import type { ContactsRepository } from '../../domain/contact.repository'
import type { Page, PageParams } from '../../../../shared/types/pagination'
import { NotFoundError } from '../../../../shared/errors'

export interface ListContactStateChangesInput extends PageParams {
  contactId: string
}

export interface ListContactStateChangesDeps {
  repo: ContactsRepository
}

export async function listContactStateChanges(input: ListContactStateChangesInput, deps: ListContactStateChangesDeps): Promise<Page<ContactStateChange>> {
  const contact = await deps.repo.findById(input.contactId)
  if (!contact) {
    throw new NotFoundError(`Contact ${input.contactId} not found`)
  }
  return deps.repo.findStateChanges(input.contactId, { limit: input.limit, offset: input.offset })
}
