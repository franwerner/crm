import { useState } from 'react'
import { Checkbox } from '@shared/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { Button } from '@shared/ui/button'
// Import directly from shared/api to avoid cross-feature coupling (adr02-1-features-isolated).
// features/settings wraps this same hook but we must not import across features.
import { useGetAnalysisTemplates } from '@shared/api/hooks/useGetAnalysisTemplates'
import { useImportMappingMutation } from '@features/imports/hooks/use-import-mapping-mutation'
import type { SetMappingBody } from '@shared/api/types/SetMappingBody'

export interface TemplateStepData {
  analyzeOnComplete: boolean
  enrichmentTemplateId: string | null
}

interface TemplateStepProps {
  importId: string
  // The column mapping collected in the previous step — submitted here alongside analyze options
  // so a single PATCH sends mapping + analyzeOnComplete + enrichmentTemplateId together.
  pendingMapping: Record<string, string>
  onBack: () => void
  onComplete: (data: TemplateStepData) => void
}

export function TemplateStep({ importId, pendingMapping, onBack, onComplete }: TemplateStepProps) {
  const [analyzeOnComplete, setAnalyzeOnComplete] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  const { data, isLoading } = useGetAnalysisTemplates()
  const activeTemplates = (data ?? []).filter((t) => t.isActive)

  const { setMapping: submitMapping, isPending, errorMessage } = useImportMappingMutation()

  const canProceed = !analyzeOnComplete || selectedTemplateId !== ''

  async function handleSubmit() {
    // Fire PATCH /imports/:id/mapping with mapping + analyze options in one request (B.9).
    const body: SetMappingBody = {
      mapping: pendingMapping,
      analyzeOnComplete,
      enrichmentTemplateId: analyzeOnComplete && selectedTemplateId ? selectedTemplateId : null,
    }
    await submitMapping(importId, body)

    onComplete({
      analyzeOnComplete,
      enrichmentTemplateId: analyzeOnComplete && selectedTemplateId ? selectedTemplateId : null,
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">
        Opcionalmente podés configurar un análisis automático al finalizar la ingesta.
      </p>

      <div className="flex items-center gap-3">
        <Checkbox
          id="analyze-on-complete"
          checked={analyzeOnComplete}
          onCheckedChange={(checked) => {
            setAnalyzeOnComplete(checked === true)
            if (!checked) setSelectedTemplateId('')
          }}
          disabled={isPending}
        />
        <label
          htmlFor="analyze-on-complete"
          className="cursor-pointer text-[length:var(--ds-font-size-sm)] text-foreground"
        >
          Analizar contactos al terminar la ingesta
        </label>
      </div>

      {analyzeOnComplete && (
        <div className="flex flex-col gap-2 pl-7">
          <label className="text-[length:var(--ds-font-size-xs)] font-[var(--ds-font-weight-semibold)] text-foreground">
            Template de análisis
          </label>
          {isLoading ? (
            <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
          ) : (
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elegí un template" />
              </SelectTrigger>
              <SelectContent>
                {activeTemplates.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    No hay templates activos
                  </SelectItem>
                ) : (
                  activeTemplates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
          {analyzeOnComplete && selectedTemplateId === '' && activeTemplates.length > 0 && (
            <p className="text-[length:var(--ds-font-size-xs)] text-warning">
              Seleccioná un template para continuar.
            </p>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-[length:var(--ds-font-size-sm)] text-destructive">{errorMessage}</p>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isPending}>
          Volver
        </Button>
        <Button onClick={handleSubmit} disabled={!canProceed || isPending}>
          {isPending ? 'Iniciando…' : 'Iniciar ingesta'}
        </Button>
      </div>
    </div>
  )
}
