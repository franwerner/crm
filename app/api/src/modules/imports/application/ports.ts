// Local port re-declarations for the imports application layer.
// Re-declaring contracts here keeps imports/application independent of
// src/modules/contacts/** (rule adr02-5-slices-isolated) and
// src/shared/db/** (rule adr02-4-db-only-in-adapter).

/**
 * Minimal contact shape that the bulk-insert port requires.
 * The adapter (block 4) maps this to the full Contact aggregate.
 * Re-declared here instead of importing Contact from contacts/domain
 * to respect the slice-isolation rule (adr02-5).
 */
export interface ImportContactRecord {
  id: string
  name: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  channels: ImportChannelRecord[]
}

export interface ImportChannelRecord {
  id: string
  contactId: string
  channelType: 'Email' | 'Phone'
  value: string
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
  verificationStatus: 'unverified' | 'valid' | 'invalid'
  verifiedAt: Date | null
  verificationDetail: object | null
}

/**
 * Port for bulk-inserting contacts during ingestion.
 * Re-declared locally (not imported from contacts/domain) per adr02-5.
 * The adapter receives an `ImportContactRecord[]` and maps to the concrete type.
 * The `tx` parameter is typed `unknown` so this port does not depend on @shared/db.
 */
export interface ImportBulkContactPort {
  createMany(contacts: ImportContactRecord[], tx?: unknown): Promise<void>
}

/**
 * Unit-of-work port re-declared locally so imports/application never imports
 * from src/shared/db (rule adr02-4-db-only-in-adapter).
 * The adapter (DrizzleUnitOfWork, block 4) implements this by delegating to
 * the shared UnitOfWork over DrizzleTx; the use-case only sees this interface.
 */
export interface ImportUnitOfWork {
  withTransaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T>
}
