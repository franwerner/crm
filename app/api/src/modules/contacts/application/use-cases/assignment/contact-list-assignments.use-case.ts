import type { ContactAssignmentListItem, ContactQueries } from '@modules/contacts/application/contact.query'
import type { Page } from '@shared/types/pagination'

export interface ListContactAssignmentsInput {
  contactId: string
  limit: number
  offset: number
}

export class ContactListAssignmentsUseCase {
  constructor(private readonly queries: ContactQueries) {}

  async execute(input: ListContactAssignmentsInput): Promise<Page<ContactAssignmentListItem>> {
    return this.queries.listAssignments(input.contactId, { limit: input.limit, offset: input.offset })
  }
}
