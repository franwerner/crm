// Drizzle adapter — Drizzle ONLY inside this file (EDR data-access.md).
import { eq, inArray } from 'drizzle-orm'
import type { Db, DrizzleTx } from '@shared/db/client'
import { imports as importsTable } from '@shared/db/schema'
import { Import } from '@modules/imports/domain/import'
import type { ImportStatus } from '@modules/imports/domain/types/import-status'
import type { ImportStage } from '@modules/imports/domain/types/import-stage'
import type { ImportsRepository } from '@modules/imports/domain/import.repository'

// Row shape as Drizzle returns it from the imports table.
type ImportRow = typeof importsTable.$inferSelect

function rowToImport(row: ImportRow): Import {
  return Import.reconstitute({
    id: row.id,
    filename: row.filename,
    fileKey: row.fileKey,
    status: row.status as ImportStatus,
    stage: row.stage as ImportStage | null,
    columnHeaders: row.columnHeaders as string[],
    mapping: row.mapping as Record<string, string> | null,
    templateId: row.templateId,
    totalRows: row.totalRows,
    processedRows: row.processedRows,
    lastRowNumber: row.lastRowNumber,
    okCount: row.okCount,
    failedCount: row.failedCount,
    duplicatedCount: row.duplicatedCount,
    rejectedCsvKey: row.rejectedCsvKey,
    createdBy: row.createdBy,
    startedAt: row.startedAt,
    analyzeOnComplete: row.analyzeOnComplete,
    enrichmentTemplateId: row.enrichmentTemplateId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

function importToRow(record: Import): typeof importsTable.$inferInsert {
  return {
    id: record.id,
    filename: record.filename,
    fileKey: record.fileKey,
    status: record.status,
    stage: record.stage,
    columnHeaders: record.columnHeaders as string[],
    mapping: record.mapping ?? null,
    templateId: record.templateId,
    totalRows: record.totalRows,
    processedRows: record.processedRows,
    lastRowNumber: record.lastRowNumber,
    okCount: record.okCount,
    failedCount: record.failedCount,
    duplicatedCount: record.duplicatedCount,
    rejectedCsvKey: record.rejectedCsvKey,
    createdBy: record.createdBy,
    startedAt: record.startedAt,
    analyzeOnComplete: record.analyzeOnComplete,
    enrichmentTemplateId: record.enrichmentTemplateId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export class DrizzleImportsRepository implements ImportsRepository {
  constructor(private readonly db: Db) {}

  async save(record: Import): Promise<void> {
    const row = importToRow(record)
    await this.db
      .insert(importsTable)
      .values(row)
      .onConflictDoUpdate({
        target: importsTable.id,
        set: {
          status: row.status,
          stage: row.stage,
          columnHeaders: row.columnHeaders,
          mapping: row.mapping,
          totalRows: row.totalRows,
          processedRows: row.processedRows,
          lastRowNumber: row.lastRowNumber,
          okCount: row.okCount,
          failedCount: row.failedCount,
          duplicatedCount: row.duplicatedCount,
          rejectedCsvKey: row.rejectedCsvKey,
          startedAt: row.startedAt,
          analyzeOnComplete: row.analyzeOnComplete,
          enrichmentTemplateId: row.enrichmentTemplateId,
          updatedAt: row.updatedAt,
        },
      })
  }

  async findById(id: string): Promise<Import | null> {
    const rows = await this.db
      .select()
      .from(importsTable)
      .where(eq(importsTable.id, id))
      .limit(1)

    const row = rows[0]
    return row ? rowToImport(row) : null
  }

  async findByStatus(status: ImportStatus): Promise<Import[]> {
    const rows = await this.db
      .select()
      .from(importsTable)
      .where(eq(importsTable.status, status))

    return rows.map(rowToImport)
  }

  async saveProgress(record: Import, tx?: unknown): Promise<void> {
    // Cast to DrizzleTx — callers that pass a UoW tx always supply a DrizzleTx.
    // The port accepts `unknown` to avoid importing DB types at the domain boundary (EDR adr02-1b-port-contract).
    const drizzleTx = tx as DrizzleTx | undefined

    const values = {
      processedRows: record.processedRows,
      lastRowNumber: record.lastRowNumber,
      okCount: record.okCount,
      failedCount: record.failedCount,
      duplicatedCount: record.duplicatedCount,
      updatedAt: record.updatedAt,
    }

    const executor = drizzleTx ?? this.db
    await executor
      .update(importsTable)
      .set(values)
      .where(eq(importsTable.id, record.id))
  }

  async findStaleProcessing(staleBeforeMs: number): Promise<Import[]> {
    // Fetch all processing imports, then filter by startedAt in application code.
    // Avoids a raw SQL expression in the where clause and keeps the adapter simple.
    const rows = await this.db
      .select()
      .from(importsTable)
      .where(eq(importsTable.status, 'processing'))

    const staleThreshold = new Date(Date.now() - staleBeforeMs)
    return rows
      .filter((row) => row.startedAt !== null && row.startedAt < staleThreshold)
      .map(rowToImport)
  }
}
