// Reconciliation job — re-enqueues pending and stale-processing imports.
// Registered in the WorkerRegistry; runs once per worker startup (D9).
import type { ReconciliationJob } from '@shared/queue'
import type { ImportReconcileUseCase } from '@modules/imports/application/use-cases/import-reconcile.use-case'
import type { Logger } from '@shared/logger'
import { config } from '@shared/config'

export class ImportsReconciliationJob implements ReconciliationJob {
  readonly name = 'imports-reconciliation'

  constructor(
    private readonly reconcileUseCase: ImportReconcileUseCase,
    private readonly logger: Logger,
  ) {}

  async run(): Promise<void> {
    try {
      await this.reconcileUseCase.execute({
        processingStaleMs: config.importProcessingStaleMs,
      })
      this.logger.info('Imports reconciliation completed')
    } catch (err) {
      // Errors in reconciliation are logged but must not crash the worker (D9).
      const msg = err instanceof Error ? err.message : String(err)
      this.logger.error({ err }, `Imports reconciliation failed: ${msg}`)
    }
  }
}
