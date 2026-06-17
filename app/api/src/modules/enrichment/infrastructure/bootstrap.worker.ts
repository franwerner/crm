// Worker-side bootstrap for the enrichment module.
// Registers the enrich-llm job handler and reconciliation job.
import type { WorkerRegistry } from '@shared/queue'
import type { Logger } from '@shared/logger'
import type { EnrichmentModule } from '@modules/enrichment/infrastructure/bootstrap'
import { EnrichmentReconciliationJob } from '@modules/enrichment/infrastructure/reconciliation/enrichment-reconciliation.job'

export interface EnrichmentWorkerModule {
  reconciliation: EnrichmentReconciliationJob
}

/**
 * Register the enrichment worker handler and reconciliation job.
 *
 * @param registry   WorkerRegistry (BullMQAdapter in the worker process).
 * @param enrichment The EnrichmentModule built by bootstrapEnrichment.
 * @param logger     Structured logger.
 */
export function bootstrapEnrichmentWorker(
  registry: WorkerRegistry,
  enrichment: EnrichmentModule,
  logger: Logger,
): EnrichmentWorkerModule {
  // Register the handler for the 'enrich-llm' queue.
  // The handler is idempotent: already-completed insights are a no-op.
  registry.register<{ insightId: string }>('enrich-llm', async (job) => {
    await enrichment.processUseCase.execute({ insightId: job.data.insightId })
  })

  const reconciliation = new EnrichmentReconciliationJob(enrichment.reconcileUseCase, logger)

  return { reconciliation }
}
