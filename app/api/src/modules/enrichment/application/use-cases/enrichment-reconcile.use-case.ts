import type { ContactInsightRepository } from '@modules/enrichment/domain/contact-insight.repository'
import type { QueueProducer } from '@shared/queue'
import { config } from '@shared/config'

export interface ReconcileEnrichmentInput {
  processingStaleMs: number
}

export class EnrichmentReconcileUseCase {
  constructor(
    private readonly insightRepo: ContactInsightRepository,
    private readonly queue: QueueProducer,
  ) {}

  async execute(input: ReconcileEnrichmentInput): Promise<void> {
    const stale = await this.insightRepo.findStale(input.processingStaleMs)

    for (const insight of stale) {
      if (insight.attempts >= config.llmMaxAttempts) {
        // Exhausted attempts — mark as failed, preserving the real lastError from the last retry
        const reason = insight.lastError ?? 'Stale: exhausted max attempts during reconciliation'
        const failed = insight.markFailed(reason, new Date())
        await this.insightRepo.save(failed)
        continue
      }

      // Return to queued for re-processing
      let requeued = insight
      if (insight.status === 'processing') {
        requeued = insight.markFailed('Stale: timed out in processing', new Date()).resetForRetry(new Date())
      }
      if (requeued.status === 'queued') {
        await this.insightRepo.save(requeued)
        await this.queue.enqueue(
          'enrich-llm',
          'enrich-llm',
          { insightId: requeued.id },
          {
            attempts: config.llmMaxAttempts,
            backoff: { type: 'exponential', delay: 10000 },
          },
        )
      }
    }
  }
}
