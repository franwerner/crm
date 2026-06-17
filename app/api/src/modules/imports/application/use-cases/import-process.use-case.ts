import type { Import } from '@modules/imports/domain/import'
import type { ImportsRepository } from '@modules/imports/domain/import.repository'
import type { ContactChannelLookup } from '@modules/imports/application/contact-channel.query'
import type { SpreadsheetReader } from '@modules/imports/application/spreadsheet-reader'
import type { ObjectStorage } from '@shared/storage'
import type { ChannelChecker } from '@shared/verification/channel-checker'
import type { ImportBulkContactPort, ImportContactRecord, ImportUnitOfWork } from '@modules/imports/application/ports'
import { DedupIndex } from '@modules/imports/application/dedup-index'
import { RejectedCsvBuilder } from '@modules/imports/application/rejected-csv'
import { mapRowToContactInput } from '@modules/imports/application/column-mapping'
import { buildRejectedCsvKey } from '@modules/imports/application/import-storage-key'
import { calcBatchSize } from '@modules/imports/domain/policies'
import { newId } from '@shared/utils/id'

export interface ProcessImportInput {
  importId: string
}

export class ImportProcessUseCase {
  // Injected by the worker composition root — off by default (D5).
  private afterCompleted?: (contactIds: string[], importRecord: Import) => Promise<void>

  constructor(
    private readonly importsRepo: ImportsRepository,
    private readonly contactBulkRepo: ImportBulkContactPort,
    private readonly channelLookup: ContactChannelLookup,
    private readonly reader: SpreadsheetReader,
    private readonly storage: ObjectStorage,
    private readonly uow: ImportUnitOfWork,
    private readonly checker: ChannelChecker,
  ) {}

  setAfterCompleted(fn: (contactIds: string[], importRecord: Import) => Promise<void>): void {
    this.afterCompleted = fn
  }

  async execute(input: ProcessImportInput): Promise<void> {
    const importRecord = await this.importsRepo.findById(input.importId)
    if (!importRecord) return

    // Idempotency guard — completed/failed imports are a no-op (R3.6).
    if (importRecord.status === 'completed' || importRecord.status === 'failed') return

    const now = new Date()
    let current = importRecord.startProcessing(now)
    await this.importsRepo.save(current)

    try {
      // --- Counting pass (stage=counting) ---
      const totalRows = await this.reader.countRows(current.fileKey)
      current = current.setTotalRows(totalRows, new Date())
      await this.importsRepo.save(current)

      const batchSize = calcBatchSize(totalRows)
      const mapping = current.mapping!

      // Resume from last committed row.number (blank-safe anchor per D7).
      const resumeFromRowNumber = current.lastRowNumber

      // In-memory dedup index for intra-file duplicates (R4.2).
      const dedupIndex = new DedupIndex()
      const rejectedCsv = new RejectedCsvBuilder()

      // Running counters (resume-aware: start from already-committed counts).
      let okCount = current.okCount
      let failedCount = current.failedCount
      let duplicatedCount = current.duplicatedCount
      let processedRows = current.processedRows
      let lastRowNumber = current.lastRowNumber

      // Accumulates all contact IDs created by this import (used for T1 callback, D5).
      const createdContactIds: string[] = []

      // Batch accumulator.
      let batch: ImportContactRecord[] = []
      let batchLastRowNumber = lastRowNumber

      const flushBatch = async (): Promise<void> => {
        if (batch.length === 0) return

        const batchContacts = batch
        const batchRowNumber = batchLastRowNumber

        // Atomic: bulk insert contacts + checkpoint processedRows in ONE transaction (R3.4).
        await this.uow.withTransaction(async (tx) => {
          await this.contactBulkRepo.createMany(batchContacts, tx)
          current = current.saveProgress({
            processedRows,
            lastRowNumber: batchRowNumber,
            okCount,
            failedCount,
            duplicatedCount,
            now: new Date(),
          })
          await this.importsRepo.saveProgress(current, tx)
        })

        lastRowNumber = batchRowNumber
        batch = []
      }

      // --- Ingestion pass (stage=ingesting) ---
      await this.reader.streamRows(
        current.fileKey,
        resumeFromRowNumber,
        async (rowValues, rowNumber) => {
          processedRows++
          batchLastRowNumber = rowNumber

          const contactInput = mapRowToContactInput(rowValues, mapping)
          if (contactInput === null) {
            // Blank row after mapping — skip without counting (R3.2).
            processedRows--
            return
          }

          const email = contactInput.email
          const phone = contactInput.phone

          // --- Dedup: check against DB (R4.1) ---
          const existsInDb = await this.channelLookup.existsByEmailOrPhone(email, phone)
          if (existsInDb) {
            duplicatedCount++
            rejectedCsv.add({ rowNumber, reason: 'duplicate: already exists in database' })
            return
          }

          // --- Dedup: check within file (R4.2) ---
          const isNewInFile = dedupIndex.add(email, phone)
          if (!isNewInFile) {
            duplicatedCount++
            rejectedCsv.add({ rowNumber, reason: 'duplicate: already seen earlier in this file' })
            return
          }

          // --- Build contact record ---
          const contactId = newId()
          const channelNow = new Date()
          const channels = []
          let invalidChannelCount = 0

          if (email !== undefined) {
            // Run checker; a DNS failure must not abort ingestion (R8.5).
            const emailResult = await this.checker.verify('email', email).catch(() => ({
              status: 'unverified' as const,
              verifiedAt: channelNow,
              detail: { reason: 'checker_error' },
            }))
            // Invalid syntax is unusable garbage — drop the channel so it never enters
            // the CRM. 'unverified' (e.g. unreachable MX) is kept: doubt is not garbage.
            if (emailResult.status === 'invalid') {
              invalidChannelCount++
            } else {
              channels.push({
                id: newId(),
                contactId,
                channelType: 'Email' as const,
                value: email,
                isPrimary: channels.length === 0,
                createdAt: channelNow,
                updatedAt: channelNow,
                verificationStatus: emailResult.status,
                verifiedAt: emailResult.verifiedAt,
                verificationDetail: emailResult.detail,
              })
            }
          }

          if (phone !== undefined) {
            const phoneResult = await this.checker.verify('phone', phone).catch(() => ({
              status: 'unverified' as const,
              verifiedAt: channelNow,
              detail: { reason: 'checker_error' },
            }))
            if (phoneResult.status === 'invalid') {
              invalidChannelCount++
            } else {
              // Persist the canonical E.164 form when the checker could parse it.
              const e164 = (phoneResult.detail as { e164?: string }).e164
              channels.push({
                id: newId(),
                contactId,
                channelType: 'Phone' as const,
                value: e164 ?? phone,
                isPrimary: channels.length === 0,
                createdAt: channelNow,
                updatedAt: channelNow,
                verificationStatus: phoneResult.status,
                verifiedAt: phoneResult.verifiedAt,
                verificationDetail: phoneResult.detail,
              })
            }
          }

          if (channels.length === 0) {
            // No usable identity channel — nothing was mapped, or every mapped
            // channel had invalid syntax. Either way the row is rejected.
            failedCount++
            const reason =
              invalidChannelCount > 0
                ? 'failed: invalid email/phone syntax'
                : 'failed: no email or phone channel mapped'
            rejectedCsv.add({ rowNumber, reason })
            return
          }

          // Name falls back to the first available identity value.
          const name = contactInput.name ?? email ?? phone ?? `Import row ${rowNumber}`

          batch.push({
            id: contactId,
            name,
            createdBy: current.createdBy,
            createdAt: channelNow,
            updatedAt: channelNow,
            channels,
          })
          createdContactIds.push(contactId)
          okCount++

          // Flush when batch is full.
          if (batch.length >= batchSize) {
            await flushBatch()
          }
        },
      )

      // Flush any remaining rows.
      await flushBatch()

      // --- Build and upload rejected.csv (R5) ---
      let rejectedCsvKey: string | null = null
      if (!rejectedCsv.isEmpty()) {
        rejectedCsvKey = buildRejectedCsvKey(current.id)
        const csvBuffer = rejectedCsv.toCsvBuffer()
        const blob = new Blob([new Uint8Array(csvBuffer)], { type: 'text/csv; charset=utf-8' })
        await this.storage.putObject(rejectedCsvKey, blob, 'text/csv')
      }

      // --- Finalize ---
      current = current.finalize({
        okCount,
        failedCount,
        duplicatedCount,
        processedRows,
        rejectedCsvKey,
        now: new Date(),
      })
      await this.importsRepo.save(current)

      // T1 opt-in hook (D5): fire after successful completion if injected by the composition root.
      if (this.afterCompleted && createdContactIds.length > 0) {
        await this.afterCompleted(createdContactIds, current)
      }
    } catch (err) {
      const failed = current.markFailed(new Date())
      await this.importsRepo.save(failed).catch(() => {
        // Best-effort failure persistence.
      })
      throw err
    }
  }
}
