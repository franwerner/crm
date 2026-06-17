import { ValidationError } from '@shared/errors'
import type { ObjectStorage } from '@shared/storage'
import { Import } from '@modules/imports/domain/import'
import type { ImportsRepository } from '@modules/imports/domain/import.repository'
import type { SpreadsheetReader } from '@modules/imports/application/spreadsheet-reader'
import { buildImportStorageKey } from '@modules/imports/application/import-storage-key'
import { newId } from '@shared/utils/id'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export interface UploadImportInput {
  filename: string
  contentType: string
  sizeBytes: number
  body: Blob
  createdBy: string
  /** Max allowed bytes — derived from config.importMaxFileSizeBytes. */
  maxFileSizeBytes: number
}

export interface UploadImportOutput {
  importId: string
  status: string
  columnHeaders: string[]
}

export class ImportUploadUseCase {
  constructor(
    private readonly repo: ImportsRepository,
    private readonly storage: ObjectStorage,
    private readonly reader: SpreadsheetReader,
  ) {}

  async execute(input: UploadImportInput): Promise<UploadImportOutput> {
    if (input.contentType !== XLSX_MIME) {
      throw new ValidationError('Invalid file type — only .xlsx is accepted', [
        { field: 'file', message: `Expected ${XLSX_MIME}, got ${input.contentType}` },
      ])
    }

    if (input.sizeBytes <= 0 || input.sizeBytes > input.maxFileSizeBytes) {
      throw new ValidationError('File size is invalid', [
        { field: 'file', message: `Size must be between 1 and ${input.maxFileSizeBytes} bytes` },
      ])
    }

    const importId = newId()
    const { key: fileKey } = buildImportStorageKey(importId, input.filename)
    const now = new Date()

    // Upload first; if header parsing fails, delete the orphan.
    await this.storage.putObject(fileKey, input.body, input.contentType)

    let columnHeaders: string[]
    try {
      columnHeaders = await this.reader.readHeaders(fileKey)
    } catch (err) {
      await this.storage.deleteObject(fileKey).catch(() => {
        // Cleanup failures are non-critical — the import row was never created.
      })
      throw err
    }

    const importRecord = Import.create({
      id: importId,
      filename: input.filename,
      fileKey,
      columnHeaders,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    })

    await this.repo.save(importRecord)

    return { importId, status: importRecord.status, columnHeaders }
  }
}
