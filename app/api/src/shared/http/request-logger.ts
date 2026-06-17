// Request logging middleware for Hono.
// Does NOT use hono/logger built-in or pino-http — uses the Logger port directly,
// so all request logs share the same structured format and reqId child binding.

import type { MiddlewareHandler } from 'hono'
import type { Logger } from '@shared/logger'

/**
 * Generates/propagates a request ID and creates a child logger with it.
 * Exposes the child logger as c.var.logger so handlers can log in context.
 * Logs request start and completion with method, path, status, and latency.
 */
export function requestLogger(logger: Logger): MiddlewareHandler {
  return async (c, next) => {
    // Propagate an existing request ID (e.g. from a gateway) or generate a new one.
    const reqId = c.req.header('x-request-id') ?? crypto.randomUUID()
    const childLogger = logger.child({ reqId })

    // Expose the child logger to downstream handlers via Hono context variables.
    c.set('logger', childLogger)

    const start = performance.now()
    childLogger.debug({ method: c.req.method, path: c.req.path }, 'request started')

    await next()

    const latencyMs = Math.round(performance.now() - start)
    childLogger.info(
      { method: c.req.method, path: c.req.path, status: c.res.status, latencyMs },
      'request completed',
    )
  }
}

// Extend Hono's variable map so c.var.logger is typed without casting.
declare module 'hono' {
  interface ContextVariableMap {
    logger: Logger
  }
}
