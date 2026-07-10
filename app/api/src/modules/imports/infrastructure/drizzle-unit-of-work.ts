// Drizzle UoW adapter — Drizzle ONLY inside this file (EDR data-access.md).
import type { Db, DrizzleTx } from '@shared/db/client'
import type { UnitOfWork } from '@shared/db/uow'
import type { ImportUnitOfWork } from '@modules/imports/application/ports'

/**
 * Concrete UnitOfWork adapter that wraps `db.transaction`.
 * Implements the shared `UnitOfWork` port (fn typed as DrizzleTx).
 */
export class DrizzleUnitOfWork implements UnitOfWork {
  constructor(private readonly db: Db) {}

  withTransaction<T>(fn: (tx: DrizzleTx) => Promise<T>): Promise<T> {
    return this.db.transaction(fn)
  }
}

/**
 * Thin wrapper that adapts DrizzleUnitOfWork to the local ImportUnitOfWork port.
 * ImportUnitOfWork uses `unknown` for tx so imports/application never imports DrizzleTx.
 * The wrapper casts the `unknown` tx to DrizzleTx before passing it to the real UoW.
 */
export class ImportUnitOfWorkAdapter implements ImportUnitOfWork {
  constructor(private readonly uow: DrizzleUnitOfWork) {}

  withTransaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    // The fn receives an unknown tx; internally we hand it a real DrizzleTx.
    return this.uow.withTransaction((tx: DrizzleTx) => fn(tx))
  }
}
