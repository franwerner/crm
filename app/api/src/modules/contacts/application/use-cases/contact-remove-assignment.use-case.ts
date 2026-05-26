import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import { NotFoundError } from '@shared/errors'

export interface RemoveContactAssignmentInput {
  contactId: string
  userId: string
}

export class ContactRemoveAssignmentUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: RemoveContactAssignmentInput): Promise<Contact> {
    const contact = await this.repo.findById(input.contactId)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.contactId} not found`)
    }

    const now = new Date()
    const updated = contact.removeAssignment(input.userId, now)

    await this.repo.removeAssignment(updated, input.userId)
    return updated
  }
}
