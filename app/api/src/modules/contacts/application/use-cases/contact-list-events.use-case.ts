import type { ContactEvent } from '../../domain/entities/contact-event'
import type { ContactsRepository } from '../../domain/contact.repository'
import type { Page, PageParams } from '../../../../shared/types/pagination'
import { NotFoundError } from '../../../../shared/errors'

export interface ListContactEventsInput extends PageParams {
  contactId: string
}

export interface ListContactEventsDeps {
  repo: ContactsRepository
}

export async function listContactEvents(input: ListContactEventsInput, deps: ListContactEventsDeps): Promise<Page<ContactEvent>> {
  const contact = await deps.repo.findById(input.contactId)
  if (!contact) {
    throw new NotFoundError(`Contact ${input.contactId} not found`)
  }
  return deps.repo.findEvents(input.contactId, { limit: input.limit, offset: input.offset })
}
