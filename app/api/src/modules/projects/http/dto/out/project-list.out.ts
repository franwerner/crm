import { z } from '@hono/zod-openapi'
import { paginatedResponseSchema } from '@shared/schemas/pagination.schema'

const ProjectStatusEnum = z.enum(['Draft', 'Active', 'Closed', 'Cancelled'])
const RoleEnum = z.enum(['Lead', 'Member'])

const LeadRefSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  role: RoleEnum,
})

export const ProjectListItemSchema = z
  .object({
    id: z.string().openapi({ description: 'Project UUID', example: '01938b0c-...' }),
    name: z.string().openapi({ example: 'Website Redesign' }),
    description: z.string().nullable().openapi({ example: 'Full redesign of the corporate website' }),
    contactId: z.string().openapi({ description: 'Associated contact UUID' }),
    contactName: z.string().nullable().openapi({ description: 'Associated contact name', example: 'Acme Corp' }),
    currency: z.string().openapi({ description: 'ISO 4217 currency code', example: 'USD' }),
    status: ProjectStatusEnum.openapi({ example: 'Draft' }),
    startDate: z.string().openapi({ description: 'Start date (YYYY-MM-DD)', example: '2025-01-01' }),
    plannedEndDate: z.string().openapi({ description: 'Planned end date (YYYY-MM-DD)', example: '2025-12-31' }),
    createdBy: z.string().openapi({ description: 'User UUID who created this project' }),
    createdByName: z.string().nullable().openapi({ description: 'Display name of the user who created this project', example: 'John Doe' }),
    responsiblesCount: z.number().int().openapi({ description: 'Total number of responsibles', example: 2 }),
    leads: z.array(LeadRefSchema).openapi({ description: 'Lead responsibles' }),
    createdAt: z.string().openapi({ description: 'ISO 8601 timestamp', example: '2024-01-01T00:00:00.000Z' }),
    updatedAt: z.string().openapi({ description: 'ISO 8601 timestamp', example: '2024-01-01T00:00:00.000Z' }),
  })
  .openapi('ProjectListItem')

export const ProjectListResponseSchema = paginatedResponseSchema(ProjectListItemSchema).openapi('ProjectListResponse')

export type ProjectListResponse = z.infer<typeof ProjectListResponseSchema>
