import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import { PanelCard } from '@shared/ui/panel-card'
import { getInsightStatusBadge } from '@features/contacts/constants/insight-status-badge'
import type { GetEnrichmentsId200 } from '@shared/api/types/GetEnrichmentsId'

type Props = {
  insight: GetEnrichmentsId200
  onRetry: (insightId: string) => void
  isRetrying: boolean
}

export function InsightPanel({ insight, onRetry, isRetrying }: Props) {
  const { label, variant } = getInsightStatusBadge(insight.status)

  return (
    <PanelCard
      title={
        <div className="flex items-center gap-2">
          <span>Análisis</span>
          <Badge variant={variant}>{label}</Badge>
        </div>
      }
      action={
        insight.status === 'failed' ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRetry(insight.id)}
            disabled={isRetrying}
          >
            {isRetrying ? 'Reintentando…' : 'Reintentar'}
          </Button>
        ) : undefined
      }
    >
      {(insight.status === 'queued' || insight.status === 'processing') && (
        <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground text-[length:var(--ds-font-size-sm)]">
          {/* Simple animated dot to signal in-progress state — no external dep */}
          <span className="animate-pulse text-2xl">⋯</span>
          <span>
            {insight.status === 'queued' ? 'En cola, esperando procesamiento…' : 'Procesando análisis…'}
          </span>
        </div>
      )}

      {insight.status === 'failed' && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-[length:var(--ds-font-size-sm)] text-destructive">
          <p className="font-medium mb-1">Error al procesar el análisis</p>
          {insight.lastError && (
            <p className="text-muted-foreground text-[length:var(--ds-font-size-xs)]">{insight.lastError}</p>
          )}
        </div>
      )}

      {insight.status === 'completed' && insight.result && (
        <div className="flex flex-col gap-4 pt-1">
          <div>
            <p className="text-[length:var(--ds-font-size-xs)] font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Resumen
            </p>
            <p className="text-[length:var(--ds-font-size-sm)]">{insight.result.resumen}</p>
          </div>

          {insight.result.recomendaciones.length > 0 && (
            <div>
              <p className="text-[length:var(--ds-font-size-xs)] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Recomendaciones
              </p>
              <ul className="flex flex-col gap-1 list-disc list-inside">
                {insight.result.recomendaciones.map((rec, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={i} className="text-[length:var(--ds-font-size-sm)]">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insight.result.observaciones && (
            <div>
              <p className="text-[length:var(--ds-font-size-xs)] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Observaciones
              </p>
              <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">{insight.result.observaciones}</p>
            </div>
          )}
        </div>
      )}
    </PanelCard>
  )
}
