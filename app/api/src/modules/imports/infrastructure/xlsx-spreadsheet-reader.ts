// Infra adapter — exceljs and fs ONLY inside this file (hexagonal boundary).
// exceljs WorkbookReader streams the XLSX from a local temp path so RAM stays
// bounded (~180 MB constant, spike-confirmed). NOT Workbook.xlsx.readFile (buffers to RAM).
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { unlink } from 'node:fs/promises'
import ExcelJS from 'exceljs'
import type { ObjectStorage } from '@shared/storage'
import type { SpreadsheetReader } from '@modules/imports/application/spreadsheet-reader'

const PRESIGN_TTL_SECONDS = 900 // 15 minutes — outlasts the download of a large file on a slow link

export class XlsxSpreadsheetReader implements SpreadsheetReader {
  constructor(private readonly storage: ObjectStorage) {}

  async readHeaders(fileKey: string): Promise<string[]> {
    return this.withTempFile(fileKey, async (filePath) => {
      const reader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
        sharedStrings: 'cache',
        hyperlinks: 'ignore',
        worksheets: 'emit',
        entries: 'emit',
      })

      const headers: string[] = []

      for await (const worksheet of reader) {
        // Read only the first worksheet.
        for await (const row of worksheet) {
          // row.values is 1-indexed (index 0 is always null) — slice(1) to normalise.
          const values = (row.values as (string | undefined)[] | null | undefined) ?? []
          const cells = values.slice(1)
          for (const cell of cells) {
            const text = cell != null ? String(cell).trim() : ''
            if (text.length > 0) {
              headers.push(text)
            }
          }
          // Only the first row is needed.
          break
        }
        // Only the first worksheet.
        break
      }

      return headers
    })
  }

  async countRows(fileKey: string): Promise<number> {
    return this.withTempFile(fileKey, async (filePath) => {
      const reader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
        sharedStrings: 'cache',
        hyperlinks: 'ignore',
        worksheets: 'emit',
        entries: 'emit',
      })

      let count = 0

      for await (const worksheet of reader) {
        for await (const row of worksheet) {
          // Skip the header row (row.number === 1).
          if (row.number === 1) continue
          // exceljs WorkbookReader skips blank rows automatically (bug #2772).
          // Any row that appears here is a data row.
          count++
        }
        break
      }

      return count
    })
  }

  async streamRows(
    fileKey: string,
    fromRowNumber: number,
    onRow: (rowValues: unknown[], rowNumber: number) => Promise<void>,
  ): Promise<void> {
    await this.withTempFile(fileKey, async (filePath) => {
      const reader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
        sharedStrings: 'cache',
        hyperlinks: 'ignore',
        worksheets: 'emit',
        entries: 'emit',
      })

      for await (const worksheet of reader) {
        for await (const row of worksheet) {
          // Skip the header row always.
          if (row.number === 1) continue
          // Resume support: skip rows already committed (D7).
          // row.number is the true Excel index and is preserved even with blank rows.
          if (row.number <= fromRowNumber) continue

          // row.values is 1-indexed (spike confirmed); pass it as-is so callers
          // can use the same slice(1) convention they expect from the port.
          const rowValues = (row.values as unknown[]) ?? []
          await onRow(rowValues, row.number)
        }
        break
      }
    })
  }

  /**
   * Downloads the file at `fileKey` from MinIO to a temp path, invokes `fn` with
   * the path, then removes the temp file in a finally block.
   *
   * Uses a presigned download URL + fetch so no new methods are needed on ObjectStorage.
   * The response body is streamed straight to disk (Bun.write consumes the stream
   * without materialising the whole file in RAM) so download memory stays bounded
   * even for large files — same intent as the streaming parse pass.
   */
  private async withTempFile<T>(fileKey: string, fn: (filePath: string) => Promise<T>): Promise<T> {
    // Use a unique suffix to avoid collisions when multiple jobs run concurrently.
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const filePath = join(tmpdir(), `import-${suffix}.xlsx`)

    // Download via presigned URL — keeps the adapter decoupled from S3 SDK internals.
    const url = await this.storage.getPresignedDownloadUrl(fileKey, PRESIGN_TTL_SECONDS)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to download spreadsheet from storage: HTTP ${response.status}`)
    }
    await Bun.write(filePath, response)

    try {
      return await fn(filePath)
    } finally {
      await unlink(filePath).catch(() => {
        // Best-effort cleanup; stale temp files are not critical.
      })
    }
  }
}
