import { z } from '@hono/zod-openapi'
import { paginatedResponseSchema } from '@shared/schemas/pagination.schema'
import { ProjectBudgetItemViewSchema } from '@modules/projects/http/dto/out/project-budget-item.out'

export const ProjectBudgetItemListResponseSchema = paginatedResponseSchema(ProjectBudgetItemViewSchema).openapi('ProjectBudgetItemListResponse')

export type ProjectBudgetItemListResponse = z.infer<typeof ProjectBudgetItemListResponseSchema>
