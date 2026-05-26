import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { ContactAssignmentRole } from '@modules/contacts/domain/types/contact-assignment-role'
import { NotFoundError } from '@shared/errors'

export interface UpdateContactAssignmentRoleInput {
  contactId: string
  userId: string
  role: ContactAssignmentRole
}

export class ContactUpdateAssignmentRoleUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: UpdateContactAssignmentRoleInput): Promise<Contact> {
    const contact = await this.repo.findById(input.contactId)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.contactId} not found`)
    }

    const now = new Date()
    const updated = contact.updateAssignmentRole(input.userId, input.role, now)

    await this.repo.updateAssignmentRole(updated, input.userId)
    return updated
  }
}
