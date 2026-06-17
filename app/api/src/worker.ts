// Worker entrypoint — runs as a SEPARATE process from the API.
// Shares config and the queue port but does NOT serve HTTP.
// Phase 4 registers the import job handler and reconciliation job.

import { config } from '@shared/config'
import { createPinoLogger } from '@shared/logger'
import { BullMQAdapter } from '@shared/queue/queue.bullmq'
import { db } from '@shared/db/client'
import { BunObjectStorage } from '@shared/storage'
import { DnsPhoneChannelChecker } from '@shared/verification/dns-phone-channel-checker'
import { BunRedisMxCache } from '@shared/verification/mx-cache.bun-redis'
import { bootstrapImports } from '@modules/imports/infrastructure/bootstrap'
import { bootstrapImportsWorker } from '@modules/imports/infrastructure/bootstrap.worker'
import { bootstrapEnrichment } from '@modules/enrichment/infrastructure/bootstrap'
import { bootstrapEnrichmentWorker } from '@modules/enrichment/infrastructure/bootstrap.worker'
import { DrizzleContactReadQuery } from '@modules/enrichment/infrastructure/contact-read.query.drizzle'
import { DrizzleContactBulkRepository } from '@modules/contacts/infrastructure/repositories/contact-bulk.repo-part'
import { Contact } from '@modules/contacts/domain/contact'
import type { ImportContactRecord, ImportBulkContactPort } from '@modules/imports/application/ports'

const logger = createPinoLogger({
  level: config.logLevel,
  isDevelopment: !config.isProduction,
})

const registry = new BullMQAdapter(config.redisUrl, logger)

// Fail-fast: exit immediately if Redis is unreachable.
try {
  await registry.ping()
  logger.info('Redis connection verified')
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(`[worker startup] Redis ping failed — cannot start worker: ${msg}`)
  process.exit(1)
}

const storage = new BunObjectStorage({
  endpoint: config.minioEndpoint,
  accessKeyId: config.minioAccessKey,
  secretAccessKey: config.minioSecretKey,
  bucket: config.minioBucket,
  region: config.minioRegion,
})

// MxCache backed by Bun.redis native client (D6).
const mxCache = new BunRedisMxCache(config.redisUrl)
const checker = new DnsPhoneChannelChecker(mxCache, config.importDefaultPhoneRegion)

// Worker has its own bulkRepo instance (independent from the API process).
const bulkRepo = new DrizzleContactBulkRepository(db)

// Bridge: maps ImportContactRecord → Contact so ContactBulkRepository satisfies ImportBulkContactPort.
// Lives here (composition root) because cross-slice wiring is only allowed in composition roots (adr02-5).
const importBulkPort: ImportBulkContactPort = {
  async createMany(records: ImportContactRecord[], tx?: unknown): Promise<void> {
    const mapped = records.map((r) =>
      Contact.create({
        id: r.id,
        name: r.name,
        createdBy: r.createdBy,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        channels: r.channels.map((ch) => ({
          id: ch.id,
          contactId: ch.contactId,
          channelType: ch.channelType,
          value: ch.value,
          isPrimary: ch.isPrimary,
          createdAt: ch.createdAt,
          updatedAt: ch.updatedAt,
          verificationStatus: ch.verificationStatus,
          verifiedAt: ch.verifiedAt,
          verificationDetail: ch.verificationDetail,
        })),
      }),
    )
    await bulkRepo.createMany(mapped, tx)
  },
}

const imports = bootstrapImports(db, storage, registry, logger, checker, importBulkPort)
const importsWorker = bootstrapImportsWorker(registry, imports, logger)

// Cross-slice: DrizzleContactReadQuery reads shared schema; wiring lives only here (adr02-5).
const contactReadQuery = new DrizzleContactReadQuery(db)
const enrichment = bootstrapEnrichment(db, registry, logger, contactReadQuery)
const enrichmentWorker = bootstrapEnrichmentWorker(registry, enrichment, logger)

// T1 cross-cut: inject afterCompleted callback into the import process use-case.
// The callback is off by default; only fires when the import has analyzeOnComplete=true.
imports.processUseCase.setAfterCompleted(async (contactIds, importRecord) => {
  if (!importRecord.analyzeOnComplete || !importRecord.enrichmentTemplateId) return
  await enrichment.enqueueUseCase.executeBatch(
    contactIds,
    'post_import',
    importRecord.enrichmentTemplateId,
  )
})

// Register reconciliation jobs — runs once on startup to recover pending/stale imports.
registry.registerReconciliation([importsWorker.reconciliation, enrichmentWorker.reconciliation])

// Start consuming — workers begin processing the moment they are registered.
await registry.start()

logger.info('Worker started and listening for jobs')
