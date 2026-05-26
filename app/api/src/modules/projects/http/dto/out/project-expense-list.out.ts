import { z } from '@hono/zod-openapi'
import { paginatedResponseSchema } from '@shared/schemas/pagination.schema'
import { ProjectExpenseViewSchema } from '@modules/projects/http/dto/out/project-expense.out'

export const ProjectExpenseListResponseSchema = paginatedResponseSchema(ProjectExpenseViewSchema).openapi('ProjectExpenseListResponse')

export type ProjectExpenseListResponse = z.infer<typeof ProjectExpenseListResponseSchema>
