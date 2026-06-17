// Maps import status values to display label and badge variant.
// Variants must match the badge component's accepted values.

export type ImportStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'awaiting_mapping' | 'pending'

export type BadgeVariant = 'neutral' | 'info' | 'success' | 'danger' | 'warning'

export const IMPORT_STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  awaiting_mapping: { label: 'Esperando mapeo', variant: 'warning' },
  pending: { label: 'Pendiente', variant: 'neutral' },
  queued: { label: 'En cola', variant: 'neutral' },
  processing: { label: 'Procesando', variant: 'info' },
  completed: { label: 'Completado', variant: 'success' },
  failed: { label: 'Fallido', variant: 'danger' },
}

export function getImportStatusBadge(status: string): { label: string; variant: BadgeVariant } {
  return IMPORT_STATUS_BADGE[status] ?? { label: status, variant: 'neutral' }
}
