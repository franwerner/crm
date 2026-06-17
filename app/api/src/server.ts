import { config } from '@shared/config'
import { createApp } from './app'

const { app, logger, queue } = createApp()

// Fail-fast: verify Redis connectivity before accepting traffic.
// If Redis is unreachable, exit immediately with an explicit error.
try {
  await queue.ping()
  logger.info('Redis connection verified')
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  // Use console.error here intentionally: the logger may not have flushed if pino fails.
  console.error(`[startup] Redis ping failed — cannot start API: ${msg}`)
  process.exit(1)
}

const server = Bun.serve({
  port: config.port,
  fetch: app.fetch,
})

logger.info(`CRM API listening on http://localhost:${server.port} [${config.appEnv}]`)
