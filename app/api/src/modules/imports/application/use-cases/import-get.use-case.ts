import { NotFoundError } from '@shared/errors'
import type { ImportsRepository } from '@modules/imports/domain/import.repository'
import type { ObjectStorage } from '@shared/storage'
import type { ImportStatus } from '@modules/imports/domain/types/import-status'
import type { ImportStage } from '@modules/imports/domain/types/import-stage'

const REJECTED_CSV_PRESIGN_TTL_S = 3600

export interface ImportStatusDto {
  importId: string
  status: ImportStatus
  stage: ImportStage | null
  totalRows: number | null
  processedRows: number
  okCount: number
  failedCount: number
  duplicatedCount: number
  // Presigned download URL when rejectedCsvKey is set, null otherwise (R6.2).
  rejectedCsvUrl: string | null
  columnHeaders: readonly string[]
  createdAt: Date
  updatedAt: Date
}

export class ImportGetUseCase {
  constructor(
    private readonly repo: ImportsRepository,
    private readonly storage: ObjectStorage,
  ) {}

  async execute(importId: string): Promise<ImportStatusDto> {
    const importRecord = await this.repo.findById(importId)
    if (!importRecord) {
      throw new NotFoundError(`Import ${importId} not found`)
    }

    let rejectedCsvUrl: string | null = null
    if (importRecord.rejectedCsvKey !== null) {
      rejectedCsvUrl = await this.storage.getPresignedDownloadUrl(
        importRecord.rejectedCsvKey,
        REJECTED_CSV_PRESIGN_TTL_S,
      )
    }

    return {
      importId: importRecord.id,
      status: importRecord.status,
      stage: importRecord.stage,
      totalRows: importRecord.totalRows,
      processedRows: importRecord.processedRows,
      okCount: importRecord.okCount,
      failedCount: importRecord.failedCount,
      duplicatedCount: importRecord.duplicatedCount,
      rejectedCsvUrl,
      columnHeaders: importRecord.columnHeaders,
      createdAt: importRecord.createdAt,
      updatedAt: importRecord.updatedAt,
    }
  }
}
