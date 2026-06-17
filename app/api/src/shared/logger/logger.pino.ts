// Pino adapter — the ONLY file in this codebase that imports pino or pino-pretty.
// All other code logs via the Logger interface injected by the composition root.

import pino, { type Logger as PinoInstance } from 'pino'
import type { Logger } from './logger'

/** Creates the root pino logger instance based on the current environment. */
export function createPinoLogger(opts: {
  level: string
  isDevelopment: boolean
}): Logger {
  const pinoLogger: PinoInstance = pino(
    { level: opts.level },
    // pino-pretty for human-readable output in development; JSON to stdout in production.
    // pino-pretty is loaded dynamically to avoid bundling it in production.
    opts.isDevelopment
      ? pino.transport({ target: 'pino-pretty', options: { colorize: true } })
      : undefined,
  )
  return wrapPino(pinoLogger)
}

/** Wraps a pino instance to satisfy the Logger interface. */
function wrapPino(p: PinoInstance): Logger {
  return {
    trace: (obj, msg) => (typeof obj === 'string' ? p.trace(obj) : p.trace(obj, msg)),
    debug: (obj, msg) => (typeof obj === 'string' ? p.debug(obj) : p.debug(obj, msg)),
    info: (obj, msg) => (typeof obj === 'string' ? p.info(obj) : p.info(obj, msg)),
    warn: (obj, msg) => (typeof obj === 'string' ? p.warn(obj) : p.warn(obj, msg)),
    error: (obj, msg) => (typeof obj === 'string' ? p.error(obj) : p.error(obj, msg)),
    fatal: (obj, msg) => (typeof obj === 'string' ? p.fatal(obj) : p.fatal(obj, msg)),
    child: (bindings) => wrapPino(p.child(bindings)),
  }
}
