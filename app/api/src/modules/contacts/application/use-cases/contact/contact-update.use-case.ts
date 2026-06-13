import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { ContactType } from '@modules/contacts/domain/types/contact-type'
import type { Sex } from '@modules/contacts/domain/types/sex'
import type { SourceChannel } from '@modules/contacts/domain/types/source-channel'
import type { InterestLevel } from '@modules/contacts/domain/types/interest-level'
import type { Address } from '@modules/contacts/domain/value-objects/address'
import { NotFoundError } from '@shared/errors'

export interface UpdateContactInput {
  id: string
  name?: string
  contactType?: ContactType
  sex?: Sex | null
  address?: Partial<Address>
  notes?: string | null
  sourceChannel?: SourceChannel | null
  interestLevel?: InterestLevel | null
}

export class ContactUpdateUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: UpdateContactInput): Promise<Contact> {
    const contact = await this.repo.findById(input.id)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.id} not found`)
    }

    const { id: _id, ...params } = input
    const updated = contact.update(params, new Date())

    await this.repo.updateContact(updated)
    return updated
  }
}
