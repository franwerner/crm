// Drizzle UoW adapter — Drizzle ONLY inside this file (EDR data-access.md).
import type { Db, DrizzleTx } from '@shared/db/client'
import type { UnitOfWork } from '@shared/db/uow'
import type { EnrichmentUnitOfWork } from '@modules/enrichment/application/ports'

export class DrizzleUnitOfWork implements UnitOfWork {
  constructor(private readonly db: Db) {}

  withTransaction<T>(fn: (tx: DrizzleTx) => Promise<T>): Promise<T> {
    return this.db.transaction(fn)
  }
}

/**
 * Thin wrapper that adapts DrizzleUnitOfWork to the local EnrichmentUnitOfWork port.
 * EnrichmentUnitOfWork uses `unknown` for tx so enrichment/application never imports DrizzleTx.
 */
export class EnrichmentUnitOfWorkAdapter implements EnrichmentUnitOfWork {
  constructor(private readonly uow: DrizzleUnitOfWork) {}

  withTransaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    return this.uow.withTransaction((tx: DrizzleTx) => fn(tx))
  }
}
