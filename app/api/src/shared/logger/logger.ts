// Logger port — pure interface (no pino import here).
// The concrete implementation lives in logger.pino.ts (the only file allowed to import pino).

/** Structured logger interface exposed to application and http layers. */
export interface Logger {
  trace(obj: object | string, msg?: string): void
  debug(obj: object | string, msg?: string): void
  info(obj: object | string, msg?: string): void
  warn(obj: object | string, msg?: string): void
  error(obj: object | string, msg?: string): void
  fatal(obj: object | string, msg?: string): void
  /** Returns a child logger with additional bound fields (e.g. { reqId }). */
  child(bindings: Record<string, unknown>): Logger
}
