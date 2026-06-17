import type { DrizzleTx } from '@shared/db/client'

// Port — no infrastructure import allowed here.
// The adapter (DrizzleUnitOfWork) lives in each consuming slice's infrastructure layer.
export interface UnitOfWork {
  withTransaction<T>(fn: (tx: DrizzleTx) => Promise<T>): Promise<T>
}
