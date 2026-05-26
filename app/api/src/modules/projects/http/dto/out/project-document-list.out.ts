import { z } from '@hono/zod-openapi'
import { paginatedResponseSchema } from '@shared/schemas/pagination.schema'
import { ProjectDocumentViewSchema } from '@modules/projects/http/dto/out/project-document.out'

export const ProjectDocumentListResponseSchema = paginatedResponseSchema(ProjectDocumentViewSchema).openapi('ProjectDocumentListResponse')

export type ProjectDocumentListResponse = z.infer<typeof ProjectDocumentListResponseSchema>
