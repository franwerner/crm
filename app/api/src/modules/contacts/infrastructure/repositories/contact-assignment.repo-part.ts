import { and, eq } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { contactAssignments, contacts } from '@shared/db/schema'
import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactAssignment } from '@modules/contacts/domain/entities/contact-assignment'
import type { ContactAssignmentRole } from '@modules/contacts/domain/types/contact-assignment-role'

type ContactAssignmentRow = typeof contactAssignments.$inferSelect

export function toContactAssignment(row: ContactAssignmentRow): ContactAssignment {
  return {
    id: row.id,
    contactId: row.contactId,
    userId: row.userId,
    role: row.role as ContactAssignmentRole,
    assignedBy: row.assignedBy,
    assignedAt: row.assignedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function toAssignmentRow(a: ContactAssignment): typeof contactAssignments.$inferInsert {
  return {
    id: a.id,
    contactId: a.contactId,
    userId: a.userId,
    role: a.role,
    assignedBy: a.assignedBy,
    assignedAt: a.assignedAt,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }
}

export class ContactAssignmentRepoPart {
  constructor(private readonly db: Db) {}

  async addAssignment(contact: Contact, assignment: ContactAssignment): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(contactAssignments).values(toAssignmentRow(assignment))
      await tx
        .update(contacts)
        .set({ updatedAt: contact.updatedAt })
        .where(eq(contacts.id, contact.id))
    })
  }

  async updateAssignmentRole(contact: Contact, userId: string): Promise<void> {
    const assignment = contact.assignments.find((a) => a.userId === userId)
    if (!assignment) return

    await this.db.transaction(async (tx) => {
      await tx
        .update(contactAssignments)
        .set({ role: assignment.role, updatedAt: assignment.updatedAt })
        .where(and(eq(contactAssignments.contactId, contact.id), eq(contactAssignments.userId, userId)))
      await tx
        .update(contacts)
        .set({ updatedAt: contact.updatedAt })
        .where(eq(contacts.id, contact.id))
    })
  }

  async removeAssignment(contact: Contact, userId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(contactAssignments)
        .where(and(eq(contactAssignments.contactId, contact.id), eq(contactAssignments.userId, userId)))
      await tx
        .update(contacts)
        .set({ updatedAt: contact.updatedAt })
        .where(eq(contacts.id, contact.id))
    })
  }
}
