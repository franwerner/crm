// Reconciliation job — re-enqueues stale/processing enrichment insights.
// Registered in the WorkerRegistry; runs once per worker startup.
import type { ReconciliationJob } from '@shared/queue'
import type { EnrichmentReconcileUseCase } from '@modules/enrichment/application/use-cases/enrichment-reconcile.use-case'
import type { Logger } from '@shared/logger'
import { config } from '@shared/config'

export class EnrichmentReconciliationJob implements ReconciliationJob {
  readonly name = 'enrichment-reconciliation'

  constructor(
    private readonly reconcileUseCase: EnrichmentReconcileUseCase,
    private readonly logger: Logger,
  ) {}

  async run(): Promise<void> {
    try {
      await this.reconcileUseCase.execute({
        processingStaleMs: config.enrichmentProcessingStaleMs,
      })
      this.logger.info('Enrichment reconciliation completed')
    } catch (err) {
      // Errors in reconciliation are logged but must not crash the worker.
      const msg = err instanceof Error ? err.message : String(err)
      this.logger.error({ err }, `Enrichment reconciliation failed: ${msg}`)
    }
  }
}
