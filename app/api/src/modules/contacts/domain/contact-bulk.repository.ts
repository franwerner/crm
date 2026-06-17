// Port — zero runtime dependencies; no Drizzle/DB import allowed here (ADR adr02-1b-port-contract).
// Separate from ContactsRepository so imports only depends on the narrow bulk contract.
import type { Contact } from '@modules/contacts/domain/contact'

export interface ContactBulkRepository {
  /**
   * Bulk-insert contacts. When `tx` is provided (UoW), all inserts participate in that
   * transaction; when absent the adapter self-manages its own transaction.
   * The concrete transaction type (DrizzleTx) is an infrastructure detail — the port
   * receives it as `unknown` and the adapter casts it.
   */
  createMany(contacts: Contact[], tx?: unknown): Promise<void>
}
