import type { Context } from 'hono'
import type { ContactListAssignmentsUseCase } from '@modules/contacts/application/use-cases/assignment/contact-list-assignments.use-case'
import type { ContactAddAssignmentUseCase } from '@modules/contacts/application/use-cases/assignment/contact-add-assignment.use-case'
import type { ContactUpdateAssignmentRoleUseCase } from '@modules/contacts/application/use-cases/assignment/contact-update-assignment-role.use-case'
import type { ContactRemoveAssignmentUseCase } from '@modules/contacts/application/use-cases/assignment/contact-remove-assignment.use-case'
import type { AddAssignmentRequest, UpdateAssignmentRoleRequest } from '@modules/contacts/http/dto/in/contact-assignment.in'
import type { ContactAssignmentListItem } from '@modules/contacts/application/contact.query'
import type { PaginationOnlyQuery } from '@shared/http/list-query'
import { toContactView } from './view-mappers'

export interface ContactAssignmentUseCases {
  listAssignments: ContactListAssignmentsUseCase
  addAssignment: ContactAddAssignmentUseCase
  updateAssignmentRole: ContactUpdateAssignmentRoleUseCase
  removeAssignment: ContactRemoveAssignmentUseCase
}

function toAssignmentListView(item: ContactAssignmentListItem) {
  return {
    userId: item.userId,
    userName: item.userName,
    role: item.role,
    assignedBy: item.assignedBy,
    assignedAt: item.assignedAt.toISOString(),
  }
}

export class ContactAssignmentController {
  constructor(private readonly ucs: ContactAssignmentUseCases) {}

  async listContactAssignments(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as PaginationOnlyQuery

    const page = await this.ucs.listAssignments.execute({
      contactId,
      limit: query.pagination.limit,
      offset: query.pagination.offset,
    })

    return c.json(
      {
        items: page.items.map(toAssignmentListView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }

  async addAssignment(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as AddAssignmentRequest
    const assignedBy = c.get('userId') as string

    const contact = await this.ucs.addAssignment.execute({
      contactId,
      userId: body.userId,
      role: body.role,
      assignedBy,
    })

    return c.json(toContactView(contact), 200)
  }

  async updateAssignmentRole(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const userId = c.req.param('userId') as string
    const body = c.req.valid('json' as never) as UpdateAssignmentRoleRequest

    const contact = await this.ucs.updateAssignmentRole.execute({
      contactId,
      userId,
      role: body.role,
    })

    return c.json(toContactView(contact), 200)
  }

  async removeAssignment(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const userId = c.req.param('userId') as string

    const contact = await this.ucs.removeAssignment.execute({ contactId, userId })

    return c.json(toContactView(contact), 200)
  }
}
