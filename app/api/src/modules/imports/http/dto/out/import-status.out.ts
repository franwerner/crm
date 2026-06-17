import { z } from '@hono/zod-openapi'

// R6.3: no precomputed % — the UI derives it from processedRows / totalRows.
export const ImportStatusResponseSchema = z
  .object({
    importId: z.string().uuid().openapi({ description: 'Import UUID', example: '01938b0c-0000-7000-0000-000000000001' }),
    status: z.string().openapi({ description: 'Import lifecycle status', example: 'processing' }),
    stage: z.string().nullable().openapi({ description: 'Current processing stage (null until processing begins)', example: 'ingesting' }),
    totalRows: z.number().int().nullable().openapi({ description: 'Total data rows (null until counting pass completes)', example: 1500 }),
    processedRows: z.number().int().openapi({ description: 'Rows committed so far (excludes header)', example: 600 }),
    okCount: z.number().int().openapi({ description: 'Rows successfully inserted', example: 580 }),
    failedCount: z.number().int().openapi({ description: 'Rows rejected due to validation errors', example: 10 }),
    duplicatedCount: z.number().int().openapi({ description: 'Rows skipped as duplicates', example: 10 }),
    // R6.2: presigned download URL when rejectedCsvKey is set.
    rejectedCsvUrl: z.string().url().nullable().openapi({ description: 'Presigned URL for rejected.csv (null when no rejects)', example: 'https://storage/imports/...' }),
    columnHeaders: z.array(z.string()).openapi({ description: 'Column headers from the original file', example: ['Full Name', 'Email'] }),
    createdAt: z.string().openapi({ description: 'ISO 8601 creation timestamp', example: '2025-01-01T00:00:00.000Z' }),
    updatedAt: z.string().openapi({ description: 'ISO 8601 last-updated timestamp', example: '2025-01-01T00:01:00.000Z' }),
  })
  .openapi('ImportStatusResponse')

export type ImportStatusResponse = z.infer<typeof ImportStatusResponseSchema>
