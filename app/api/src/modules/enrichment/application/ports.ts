// Local port re-declarations for the enrichment application layer.
// Re-declaring contracts here keeps enrichment/application independent of
// @shared/db (rule adr02-4-db-only-in-adapter) and other slices (adr02-5).

import type { FilterGroup } from '@shared/types/filters'

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
 * Input for filter-based ID resolution (EDR cross-slice-id-resolution).
 * Types from @shared/types/filters are allowed by adr02-2b-read-port.
 */
export interface ContactFilterInput {
  filterGroups: FilterGroup[]
  search?: string
}

/**
 * Cross-slice read-port for loading a contact's data without importing contacts module.
 * The adapter queries @shared/db/schema directly (EDR inter-layer-communication §3.3).
 *
 * resolveByFilter: Fase 3 addition — returns only the IDs that match the given
 * filter, reusing the DNF grammar from contacts (EDR cross-slice-id-resolution).
 */
export interface ContactReadQuery {
  findById(contactId: string): Promise<ContactReadDto | null>
  resolveByFilter(input: ContactFilterInput): Promise<string[]>
}
