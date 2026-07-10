// Drizzle adapter — Drizzle ONLY inside this file (EDR data-access.md).
import { desc, sql } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { imports as importsTable } from '@shared/db/schema'
import type { ImportQueries, ImportListItem } from '@modules/imports/application/import.query'
import type { ImportStatus } from '@modules/imports/domain/types/import-status'
import type { ImportStage } from '@modules/imports/domain/types/import-stage'
import type { Page, PageParams } from '@shared/types/pagination'
import type { ObjectStorage } from '@shared/storage'

const REJECTED_CSV_PRESIGN_TTL_S = 3600

export class DrizzleImportQueries implements ImportQueries {
  constructor(
    private readonly db: Db,
    private readonly storage: ObjectStorage,
  ) {}

  async list(params: PageParams): Promise<Page<ImportListItem>> {
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(importsTable),
      this.db
        .select({
          id: importsTable.id,
          status: importsTable.status,
          stage: importsTable.stage,
          totalRows: importsTable.totalRows,
          processedRows: importsTable.processedRows,
          okCount: importsTable.okCount,
          failedCount: importsTable.failedCount,
          duplicatedCount: importsTable.duplicatedCount,
          rejectedCsvKey: importsTable.rejectedCsvKey,
          createdAt: importsTable.createdAt,
        })
        .from(importsTable)
        .orderBy(desc(importsTable.createdAt))
        .limit(params.limit)
        .offset(params.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)

    // Resolve presigned URLs for rows that have rejected files.
    // Batch to avoid N sequential awaits when many rows have rejects.
    const items: ImportListItem[] = await Promise.all(
      rows.map(async (row) => {
        let rejectedCsvUrl: string | null = null
        if (row.rejectedCsvKey !== null) {
          rejectedCsvUrl = await this.storage.getPresignedDownloadUrl(
            row.rejectedCsvKey,
            REJECTED_CSV_PRESIGN_TTL_S,
          )
        }

        return {
          id: row.id,
          status: row.status as ImportStatus,
          stage: row.stage as ImportStage | null,
          totalRows: row.totalRows,
          processedRows: row.processedRows,
          okCount: row.okCount,
          failedCount: row.failedCount,
          duplicatedCount: row.duplicatedCount,
          rejectedCsvUrl,
          createdAt: row.createdAt,
        }
      }),
    )

    return { items, total, limit: params.limit, offset: params.offset }
  }
}
