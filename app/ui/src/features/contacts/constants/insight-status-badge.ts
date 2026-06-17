// Maps insight status values to display label and badge variant.
// Variants must match the badge component's accepted values.

export type InsightStatus = 'queued' | 'processing' | 'completed' | 'failed'

export type BadgeVariant = 'neutral' | 'info' | 'success' | 'danger' | 'warning'

export const INSIGHT_STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  queued: { label: 'En cola', variant: 'neutral' },
  processing: { label: 'Procesando', variant: 'info' },
  completed: { label: 'Completado', variant: 'success' },
  failed: { label: 'Fallido', variant: 'danger' },
}

export function getInsightStatusBadge(status: string): { label: string; variant: BadgeVariant } {
  return INSIGHT_STATUS_BADGE[status] ?? { label: status, variant: 'neutral' }
}
