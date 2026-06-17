// Read-port for import list queries — no Drizzle/DB import allowed here
// (ADR adr02-1b-port-contract). Kept separate from ImportsRepository because
// list reads are projections, not aggregate root operations.
import type { ImportStatus } from '@modules/imports/domain/types/import-status'
import type { ImportStage } from '@modules/imports/domain/types/import-stage'
import type { Page, PageParams } from '@shared/types/pagination'

export interface ImportListItem {
  id: string
  status: ImportStatus
  stage: ImportStage | null
  totalRows: number | null
  processedRows: number
  okCount: number
  failedCount: number
  duplicatedCount: number
  // Presigned URL resolved by the query adapter, null when no rejects
  rejectedCsvUrl: string | null
  createdAt: Date
}

export interface ImportQueries {
  list(params: PageParams): Promise<Page<ImportListItem>>
}
