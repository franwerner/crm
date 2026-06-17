// Public barrel — the Logger interface is the default surface.
// createPinoLogger is also exported for use in composition roots (app.ts, worker.ts).

export type { Logger } from './logger'
export { createPinoLogger } from './logger.pino'
