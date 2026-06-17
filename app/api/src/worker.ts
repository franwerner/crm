// Worker entrypoint — runs as a SEPARATE process from the API.
// Shares config and the queue port but does NOT serve HTTP.
// Phases 1/2 register concrete JobHandlers here; Phase 0 = boilerplate + ping.

import { config } from '@shared/config'
import { createPinoLogger } from '@shared/logger'
import { BullMQAdapter } from '@shared/queue/queue.bullmq'

const logger = createPinoLogger({
  level: config.logLevel,
  isDevelopment: !config.isProduction,
})

const registry = new BullMQAdapter(config.redisUrl)

// Fail-fast: exit immediately if Redis is unreachable.
try {
  await registry.ping()
  logger.info('Redis connection verified')
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(`[worker startup] Redis ping failed — cannot start worker: ${msg}`)
  process.exit(1)
}

// Register reconciliation jobs (Phase 0 = empty list; Phases 1/2 populate this).
registry.registerReconciliation([])

// Start consuming — workers begin processing the moment they are registered.
await registry.start()

logger.info('Worker started and listening for jobs')
