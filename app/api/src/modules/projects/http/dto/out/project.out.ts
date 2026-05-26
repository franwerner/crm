import { z } from '@hono/zod-openapi'

const ProjectStatusEnum = z.enum(['Draft', 'Active', 'Closed', 'Cancelled'])
const RoleEnum = z.enum(['Lead', 'Member'])

const ResponsibleViewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string().nullable(),
  role: RoleEnum,
  assignedBy: z.string(),
  assignedAt: z.string(),
})

export const MoneySchema = z
  .object({
    amountMinor: z.number().openapi({ description: 'Amount in minor currency units', example: 150000 }),
    currency: z.string().openapi({ description: 'ISO 4217 currency code', example: 'USD' }),
  })
  .openapi('Money')

export const ProjectProfitSchema = z
  .object({
    amountMinor: z.number().openapi({ description: 'Signed amount in minor currency units (may be negative)', example: -30000 }),
    currency: z.string().openapi({ description: 'ISO 4217 currency code', example: 'USD' }),
  })
  .openapi('ProjectProfit')

const ProjectTotalsSchema = z.object({
  budget: MoneySchema,
  expenses: MoneySchema,
  profit: ProjectProfitSchema,
})

export const ProjectViewSchema = z
  .object({
    id: z.string().openapi({ description: 'Project UUID', example: '01938b0c-...' }),
    name: z.string().openapi({ example: 'Website Redesign' }),
    description: z.string().nullable().openapi({ example: 'Full redesign of the corporate website' }),
    contactId: z.string().openapi({ description: 'Associated contact UUID' }),
    currency: z.string().openapi({ description: 'ISO 4217 currency code', example: 'USD' }),
    status: ProjectStatusEnum.openapi({ example: 'Draft' }),
    startDate: z.string().openapi({ description: 'Start date (YYYY-MM-DD)', example: '2025-01-01' }),
    originalPlannedEndDate: z.string().openapi({ description: 'Original planned end date before any extensions (YYYY-MM-DD)', example: '2025-12-31' }),
    plannedEndDate: z.string().openapi({ description: 'Derived planned end date including all extensions (YYYY-MM-DD)', example: '2026-01-14' }),
    createdBy: z.string().openapi({ description: 'User UUID who created this project' }),
    responsibles: z.array(ResponsibleViewSchema).openapi({ description: 'Project responsibles' }),
    totals: ProjectTotalsSchema.openapi({ description: 'Derived financial totals' }),
    createdAt: z.string().openapi({ description: 'ISO 8601 timestamp', example: '2024-01-01T00:00:00.000Z' }),
    updatedAt: z.string().openapi({ description: 'ISO 8601 timestamp', example: '2024-01-01T00:00:00.000Z' }),
  })
  .openapi('ProjectView')

export type ProjectView = z.infer<typeof ProjectViewSchema>
