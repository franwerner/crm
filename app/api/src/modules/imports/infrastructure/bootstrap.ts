// API-side bootstrap for the imports module.
// Wires all adapters, use-cases, and the HTTP router.
import type { OpenAPIHono } from '@hono/zod-openapi'
import type { Db } from '@shared/db/client'
import type { ObjectStorage } from '@shared/storage'
import type { QueueProducer } from '@shared/queue'
import type { Logger } from '@shared/logger'
import type { ChannelChecker } from '@shared/verification/channel-checker'
import type { ImportBulkContactPort } from '@modules/imports/application/ports'
import { DrizzleImportsRepository } from '@modules/imports/infrastructure/import.repository.bun'
import { DrizzleImportQueries } from '@modules/imports/infrastructure/import.query.drizzle'
import { DrizzleContactChannelLookup } from '@modules/imports/infrastructure/contact-channel.query.drizzle'
import { DrizzleUnitOfWork, ImportUnitOfWorkAdapter } from '@modules/imports/infrastructure/drizzle-unit-of-work'
import { XlsxSpreadsheetReader } from '@modules/imports/infrastructure/xlsx-spreadsheet-reader'
import { ImportUploadUseCase } from '@modules/imports/application/use-cases/import-upload.use-case'
import { ImportSetMappingUseCase } from '@modules/imports/application/use-cases/import-set-mapping.use-case'
import { ImportGetUseCase } from '@modules/imports/application/use-cases/import-get.use-case'
import { ImportListUseCase } from '@modules/imports/application/use-cases/import-list.use-case'
import { ImportProcessUseCase } from '@modules/imports/application/use-cases/import-process.use-case'
import { ImportReconcileUseCase } from '@modules/imports/application/use-cases/import-reconcile.use-case'
import { ImportsController } from '@modules/imports/http/import.controller'
import { createImportsRouter } from '@modules/imports/http/import.routes'

export interface ImportsModule {
  /** HTTP router — mounted by app.ts. */
  router: OpenAPIHono
  upload: ImportUploadUseCase
  setMapping: ImportSetMappingUseCase
  get: ImportGetUseCase
  list: ImportListUseCase
  processUseCase: ImportProcessUseCase
  reconcileUseCase: ImportReconcileUseCase
}

/**
 * Bootstrap the imports module.
 *
 * @param db          Drizzle database instance (shared).
 * @param storage     Object storage instance (shared).
 * @param queue       Queue producer (shared; API-side enqueue only).
 * @param logger      Structured logger (shared).
 * @param checker     Channel verification service built once in app.ts (D8).
 * @param bulkPort    ImportBulkContactPort — provided by app.ts as a bridge adapter
 *                    that wraps ContactBulkRepository (cross-slice wiring lives in app.ts).
 */
export function bootstrapImports(
  db: Db,
  storage: ObjectStorage,
  queue: QueueProducer,
  logger: Logger,
  checker: ChannelChecker,
  bulkPort: ImportBulkContactPort,
): ImportsModule {
  void logger

  const repo = new DrizzleImportsRepository(db)
  const queries = new DrizzleImportQueries(db, storage)
  const channelLookup = new DrizzleContactChannelLookup(db)
  const uow = new DrizzleUnitOfWork(db)
  const importUow = new ImportUnitOfWorkAdapter(uow)
  const reader = new XlsxSpreadsheetReader(storage)

  const upload = new ImportUploadUseCase(repo, storage, reader)
  const setMapping = new ImportSetMappingUseCase(repo, queue)
  const get = new ImportGetUseCase(repo, storage)
  const list = new ImportListUseCase(queries)
  const processUseCase = new ImportProcessUseCase(
    repo,
    bulkPort,
    channelLookup,
    reader,
    storage,
    importUow,
    checker,
  )
  const reconcileUseCase = new ImportReconcileUseCase(repo, queue)

  const controller = new ImportsController({ upload, setMapping, get, list })
  const router = createImportsRouter(controller)

  return {
    router,
    upload,
    setMapping,
    get,
    list,
    processUseCase,
    reconcileUseCase,
  }
}
