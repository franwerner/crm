// Port — no Drizzle/DB import allowed here (ADR adr02-1b-port-contract).
import type { Import } from '@modules/imports/domain/import'
import type { ImportStatus } from '@modules/imports/domain/types/import-status'

export interface ImportsRepository {
  save(importRecord: Import): Promise<void>
  findById(id: string): Promise<Import | null>
  findByStatus(status: ImportStatus): Promise<Import[]>
  /**
   * Persist progress fields atomically. When `tx` is provided (UoW), the write
   * participates in that transaction; when absent the adapter self-manages.
   * Typed as `unknown` so the domain port does not import @shared/db (ADR adr02-1b-port-contract).
   */
  saveProgress(importRecord: Import, tx?: unknown): Promise<void>
  /**
   * Find processing imports whose startedAt is older than the stale threshold.
   * Used by the reconciliation job (R7.2).
   */
  findStaleProcessing(staleBeforeMs: number): Promise<Import[]>
}
