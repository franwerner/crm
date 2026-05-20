import { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { SourceChannel } from '@modules/contacts/domain/types/source-channel'
import type { InterestLevel } from '@modules/contacts/domain/types/interest-level'
import { newId } from '@shared/utils/id'

export interface CreateContactInput {
  name: string
  handle?: string | null
  phone?: string | null
  sourceChannel?: SourceChannel | null
  interestLevel?: InterestLevel | null
  createdBy: string
}

export interface CreateContactDeps {
  repo: ContactsRepository
}

export async function createContact(input: CreateContactInput, deps: CreateContactDeps): Promise<Contact> {
  const now = new Date()
  const contact = Contact.create({
    id: newId(),
    name: input.name,
    handle: input.handle,
    phone: input.phone,
    sourceChannel: input.sourceChannel,
    interestLevel: input.interestLevel,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  })
  await deps.repo.save(contact)
  return contact
}
