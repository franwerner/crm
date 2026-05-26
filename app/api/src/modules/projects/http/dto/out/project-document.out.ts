import { z } from '@hono/zod-openapi'

export const ProjectDocumentViewSchema = z
  .object({
    id: z.string().openapi({ description: 'Document UUID' }),
    projectId: z.string().openapi({ description: 'Project UUID' }),
    fileName: z.string().openapi({ description: 'Sanitized file name', example: 'contrato-firmado.pdf' }),
    contentType: z.string().openapi({ description: 'MIME type', example: 'application/pdf' }),
    sizeBytes: z.number().openapi({ description: 'File size in bytes', example: 204800 }),
    uploadedBy: z.string().openapi({ description: 'User UUID who uploaded the document' }),
    uploadedAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
    createdAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
    updatedAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
  })
  .openapi('ProjectDocumentView')

export type ProjectDocumentView = z.infer<typeof ProjectDocumentViewSchema>
