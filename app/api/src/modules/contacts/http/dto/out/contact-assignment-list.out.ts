import { z } from '@hono/zod-openapi'
import { paginatedResponseSchema } from '@shared/schemas/pagination.schema'

const AssignmentRoleEnum = z.enum(['Owner', 'Collaborator'])

export const ContactAssignmentListItemSchema = z
  .object({
    userId: z.string().openapi({ description: 'UUID of the assigned user' }),
    userName: z.string().openapi({ description: 'Display name of the assigned user', example: 'Jane Doe' }),
    role: AssignmentRoleEnum.openapi({ example: 'Owner' }),
    assignedBy: z.string().openapi({ description: 'UUID of the user that performed the assignment' }),
    assignedAt: z.string().openapi({ description: 'ISO 8601 timestamp', example: '2024-01-01T00:00:00.000Z' }),
  })
  .openapi('ContactAssignmentListItem')

export const ContactAssignmentListResponseSchema = paginatedResponseSchema(ContactAssignmentListItemSchema).openapi('ContactAssignmentListResponse')

export type ContactAssignmentListResponse = z.infer<typeof ContactAssignmentListResponseSchema>
