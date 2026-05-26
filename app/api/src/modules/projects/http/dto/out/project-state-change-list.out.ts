import { z } from '@hono/zod-openapi'
import { paginatedResponseSchema } from '@shared/schemas/pagination.schema'
import { ProjectStateChangeViewSchema } from '@modules/projects/http/dto/out/project-state-change.out'

export const ProjectStateChangeListResponseSchema = paginatedResponseSchema(ProjectStateChangeViewSchema).openapi('ProjectStateChangeListResponse')

export type ProjectStateChangeListResponse = z.infer<typeof ProjectStateChangeListResponseSchema>
