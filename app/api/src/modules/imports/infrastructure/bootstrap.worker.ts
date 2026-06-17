// Worker-side bootstrap for the imports module.
// Registers the import job handler and reconciliation job.
import type { WorkerRegistry } from '@shared/queue'
import type { Logger } from '@shared/logger'
import type { ImportsModule } from '@modules/imports/infrastructure/bootstrap'
import { ImportsReconciliationJob } from '@modules/imports/infrastructure/reconciliation/imports-reconciliation.job'

export interface ImportsWorkerModule {
  reconciliation: ImportsReconciliationJob
}

/**
 * Register the imports worker handler and reconciliation job.
 *
 * @param registry WorkerRegistry (BullMQAdapter in the worker process).
 * @param imports  The ImportsModule built by bootstrapImports.
 * @param logger   Structured logger.
 */
export function bootstrapImportsWorker(
  registry: WorkerRegistry,
  imports: ImportsModule,
  logger: Logger,
): ImportsWorkerModule {
  // Register the job handler for the 'import' queue.
  // The handler is idempotent (completed/failed imports are a no-op per R3.6).
  registry.register<{ importId: string }>('import', async (job) => {
    await imports.processUseCase.execute({ importId: job.data.importId })
  })

  const reconciliation = new ImportsReconciliationJob(imports.reconcileUseCase, logger)

  return { reconciliation }
}
