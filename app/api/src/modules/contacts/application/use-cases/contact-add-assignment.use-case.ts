import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { ContactAssignmentRole } from '@modules/contacts/domain/types/contact-assignment-role'
import { NotFoundError } from '@shared/errors'
import { newId } from '@shared/utils/id'

export interface AddContactAssignmentInput {
  contactId: string
  userId: string
  role: ContactAssignmentRole
  assignedBy: string
}

export class ContactAddAssignmentUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: AddContactAssignmentInput): Promise<Contact> {
    const contact = await this.repo.findById(input.contactId)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.contactId} not found`)
    }

    const now = new Date()
    const assignment = {
      id: newId(),
      contactId: input.contactId,
      userId: input.userId,
      role: input.role,
      assignedBy: input.assignedBy,
      assignedAt: now,
      createdAt: now,
      updatedAt: now,
    }

    const updated = contact.addAssignment(assignment)

    await this.repo.addAssignment(updated, assignment)
    return updated
  }
}
