import { z } from '@hono/zod-openapi'
import { paginatedResponseSchema } from '@shared/schemas/pagination.schema'

// List item schema — mirrors ImportListItem from the read-port.
// Excludes heavy fields (columnHeaders, mapping, fileKey) not needed for list display.
// rejectedCsvUrl is included so the UI can show a download link per row.
export const ImportListItemSchema = z
  .object({
    id: z.string().uuid().openapi({ description: 'Import UUID', example: '01938b0c-0000-7000-0000-000000000001' }),
    status: z.string().openapi({ description: 'Import lifecycle status', example: 'completed' }),
    stage: z.string().nullable().openapi({ description: 'Current processing stage (null until processing begins)', example: 'ingesting' }),
    totalRows: z.number().int().nullable().openapi({ description: 'Total data rows (null until counting pass completes)', example: 1500 }),
    processedRows: z.number().int().openapi({ description: 'Rows committed so far', example: 600 }),
    okCount: z.number().int().openapi({ description: 'Rows successfully inserted', example: 580 }),
    failedCount: z.number().int().openapi({ description: 'Rows rejected due to validation errors', example: 10 }),
    duplicatedCount: z.number().int().openapi({ description: 'Rows skipped as duplicates', example: 10 }),
    rejectedCsvUrl: z.string().url().nullable().openapi({ description: 'Presigned URL for rejected.csv (null when no rejects)', example: null }),
    createdAt: z.string().openapi({ description: 'ISO 8601 creation timestamp', example: '2025-01-01T00:00:00.000Z' }),
  })
  .openapi('ImportListItem')

export const ImportListResponseSchema = paginatedResponseSchema(ImportListItemSchema).openapi('ImportListResponse')

export type ImportListResponse = z.infer<typeof ImportListResponseSchema>
