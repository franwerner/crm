import { z } from '@hono/zod-openapi'
import { paginatedResponseSchema } from '@shared/schemas/pagination.schema'
import { ProjectExtensionViewSchema } from '@modules/projects/http/dto/out/project-extension.out'

export const ProjectExtensionListResponseSchema = paginatedResponseSchema(ProjectExtensionViewSchema).openapi('ProjectExtensionListResponse')

export type ProjectExtensionListResponse = z.infer<typeof ProjectExtensionListResponseSchema>
