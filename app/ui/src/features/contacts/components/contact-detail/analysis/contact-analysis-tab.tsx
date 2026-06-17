import { useState, useEffect } from 'react'
import { useGetAnalysisTemplates } from '@shared/api/hooks/useGetAnalysisTemplates'
import { Button } from '@shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { PanelCard } from '@shared/ui/panel-card'
import { InsightPanel } from './insight-panel'
import { useInsightStatus } from '@features/contacts/hooks/use-insight-status'
import { useEnrichContact } from '@features/contacts/hooks/use-enrich-contact'
import { useRetryInsight } from '@features/contacts/hooks/use-retry-insight'
import { useContactInsights, type ContactInsightItem } from '@features/contacts/hooks/use-contact-insights'

const TERMINAL_STATUSES = new Set(['completed', 'failed'])

type Props = {
  contactId: string
}

export function ContactAnalysisTab({ contactId }: Props) {
  // Active polling slot: set after POST /enrichments or when a pre-existing non-terminal insight is found.
  const [insightId, setInsightId] = useState<string | undefined>(undefined)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  // Load insights that already exist for this contact (from prior sessions or batch jobs).
  const { insights: existingInsights, isLoading: isLoadingExisting } = useContactInsights(contactId)

  // On mount (or when existing insights load), seed the polling slot with the most recent
  // non-terminal insight so in-progress jobs get polled automatically.
  useEffect(() => {
    if (insightId !== undefined) return
    const nonTerminal = existingInsights.find((i) => !TERMINAL_STATUSES.has(i.status))
    if (nonTerminal) {
      setInsightId(nonTerminal.id)
    }
  }, [existingInsights, insightId])

  const { data: templates, isLoading: isLoadingTemplates } = useGetAnalysisTemplates()
  const activeTemplates = templates?.filter((t) => t.isActive) ?? []

  const { enrichContact, isPending: isEnriching } = useEnrichContact()
  const { retryInsight, isPending: isRetrying } = useRetryInsight()

  // Polling hook: enabled only when insightId is set; stops at terminal state per ADR polling-with-refetchinterval.
  const { insight: polledInsight, isLoading: isLoadingPolled } = useInsightStatus(insightId)

  // The canonical insight to render in the active polling slot (polled wins over the pre-loaded snapshot).
  const activeInsight: ContactInsightItem | undefined = polledInsight ?? existingInsights.find((i) => i.id === insightId)

  // Completed insights that are NOT in the active polling slot, shown as a historical list below.
  const otherInsights = existingInsights.filter(
    (i) => i.id !== insightId && TERMINAL_STATUSES.has(i.status),
  )

  async function handleAnalyze() {
    if (!selectedTemplateId) return
    setAnalyzeError(null)
    try {
      const ids = await enrichContact(contactId, selectedTemplateId)
      // POST /enrichments returns {insightIds, count} — poll the returned id.
      setInsightId(ids[0])
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Error al iniciar el análisis')
    }
  }

  async function handleRetry(id: string) {
    try {
      await retryInsight(id)
      // Retry puts the same insight back to queued; keep polling it.
      setInsightId(id)
    } catch {
      // Errors surface via the insight's lastError field on the next poll.
    }
  }

  function handleSelectInsight(insight: ContactInsightItem) {
    // Bring a historical insight into the active slot so the user can interact with it (e.g. retry).
    setInsightId(insight.id)
  }

  const hasAnyInsight = insightId !== undefined || existingInsights.length > 0

  return (
    <div className="flex flex-col gap-6">
      {/* Template selector + analyze action */}
      <PanelCard title="Analizar contacto">
        <div className="flex flex-col gap-3">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-[length:var(--ds-font-size-xs)] font-medium text-muted-foreground mb-1.5">
                Plantilla de análisis
              </label>
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
                disabled={isLoadingTemplates || isEnriching}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingTemplates ? 'Cargando plantillas…' : 'Seleccionar plantilla'} />
                </SelectTrigger>
                <SelectContent>
                  {activeTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.rubro}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!selectedTemplateId || isEnriching}
            >
              {isEnriching ? 'Analizando…' : 'Analizar'}
            </Button>
          </div>

          {activeTemplates.length === 0 && !isLoadingTemplates && (
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">
              No hay plantillas activas disponibles. Creá una en{' '}
              <span className="text-foreground font-medium">Configuración → Plantillas</span>.
            </p>
          )}

          {analyzeError && (
            <p className="text-[length:var(--ds-font-size-sm)] text-destructive">{analyzeError}</p>
          )}
        </div>
      </PanelCard>

      {/* Empty state: no insights exist yet */}
      {!hasAnyInsight && !isLoadingExisting && !isEnriching && (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground text-[length:var(--ds-font-size-sm)]">
          <p>No hay análisis para este contacto aún.</p>
          <p>Seleccioná una plantilla y presioná Analizar para comenzar.</p>
        </div>
      )}

      {/* Loading skeleton while initial fetch is in flight */}
      {isLoadingExisting && !hasAnyInsight && (
        <div className="flex items-center justify-center py-12">
          <span className="text-muted-foreground text-[length:var(--ds-font-size-sm)]">Cargando análisis…</span>
        </div>
      )}

      {/* Loading the polled insight right after it was created */}
      {insightId && isLoadingPolled && !activeInsight && (
        <div className="flex items-center justify-center py-12">
          <span className="text-muted-foreground text-[length:var(--ds-font-size-sm)]">Cargando análisis…</span>
        </div>
      )}

      {/* Active insight panel (handles queued / processing / completed / failed) */}
      {activeInsight && (
        <InsightPanel
          insight={activeInsight}
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      )}

      {/* Historical completed/failed insights not currently in the active slot */}
      {otherInsights.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-[length:var(--ds-font-size-xs)] font-medium text-muted-foreground uppercase tracking-wide">
            Análisis anteriores
          </p>
          {otherInsights.map((insight) => (
            <button
              key={insight.id}
              type="button"
              className="text-left"
              onClick={() => handleSelectInsight(insight)}
            >
              <InsightPanel
                insight={insight}
                onRetry={handleRetry}
                isRetrying={isRetrying}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
