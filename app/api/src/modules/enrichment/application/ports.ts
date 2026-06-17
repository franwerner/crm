// Local port re-declarations for the enrichment application layer.
// Re-declaring contracts here keeps enrichment/application independent of
// @shared/db (rule adr02-4-db-only-in-adapter) and other slices (adr02-5).

/**
 * Unit-of-work port re-declared locally so enrichment/application never imports
 * from @shared/db. The adapter (DrizzleEnrichmentUnitOfWork) casts tx to DrizzleTx.
 */
export interface EnrichmentUnitOfWork {
  withTransaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T>
}

/**
 * Read-port DTO for the contact data needed to build the enrichment prompt.
 * Re-declared here (not imported from contacts/domain) per adr02-5.
 */
export interface ContactReadDto {
  id: string
  name: string
  channels: Array<{
    channelType: string
    value: string
    isPrimary: boolean
  }>
  notes: string | null
  addressCity: string | null
  addressCountry: string | null
}

/**
 * Cross-slice read-port for loading a contact's data without importing contacts module.
 * The adapter queries @shared/db/schema directly (ADR inter-layer-communication §3.3).
 */
export interface ContactReadQuery {
  findById(contactId: string): Promise<ContactReadDto | null>
}
