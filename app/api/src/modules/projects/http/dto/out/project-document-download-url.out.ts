import { z } from '@hono/zod-openapi'

export const ProjectDocumentDownloadUrlSchema = z
  .object({
    url: z.string().url().openapi({ description: 'Presigned download URL', example: 'https://...' }),
    expiresAt: z.string().datetime().openapi({ description: 'ISO 8601 expiration timestamp' }),
  })
  .openapi('ProjectDocumentDownloadUrl')

export type ProjectDocumentDownloadUrl = z.infer<typeof ProjectDocumentDownloadUrlSchema>
