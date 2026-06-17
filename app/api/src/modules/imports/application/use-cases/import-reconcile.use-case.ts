import type { ImportsRepository } from '@modules/imports/domain/import.repository'
import type { QueueProducer } from '@shared/queue'

export interface ReconcileInput {
  /**
   * Processing imports older than this many milliseconds are considered stuck
   * and will be re-enqueued. Sourced from config.importProcessingStaleMs.
   */
  processingStaleMs: number
}

export class ImportReconcileUseCase {
  constructor(
    private readonly repo: ImportsRepository,
    private readonly queue: QueueProducer,
  ) {}

  async execute(input: ReconcileInput): Promise<void> {
    // Re-enqueue all pending imports (R7.1).
    const pending = await this.repo.findByStatus('pending')
    for (const importRecord of pending) {
      await this.queue.enqueue(
        'import',
        'process-import',
        { importId: importRecord.id },
        // BullMQ deduplicates by jobId; using importId ensures idempotency (D9).
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      )
    }

    // Re-enqueue stuck processing imports past the stale threshold (R7.2).
    const stale = await this.repo.findStaleProcessing(input.processingStaleMs)
    for (const importRecord of stale) {
      await this.queue.enqueue(
        'import',
        'process-import',
        { importId: importRecord.id },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      )
    }
    // Completed and failed imports are intentionally not touched (R7.3).
  }
}
