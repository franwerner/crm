import type { ContactAssignmentRole } from '@modules/contacts/domain/types/contact-assignment-role'

export interface ContactAssignment {
  readonly id: string
  readonly contactId: string
  readonly userId: string
  readonly role: ContactAssignmentRole
  readonly assignedBy: string
  readonly assignedAt: Date
  readonly createdAt: Date
  readonly updatedAt: Date
}
