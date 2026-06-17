import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useGetAnalysisTemplates } from '@shared/api/hooks/useGetAnalysisTemplates'
import { Button } from '@shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
  DialogBody,
  DialogFooter,
} from '@shared/ui/dialog'
import { FilterBuilder } from '@shared/ui/filter-builder/filter-builder'
import { contactsFilterSchema } from '@features/contacts/constants/contacts-filter-schema'
import { useBatchEnrichByFilter } from '@features/contacts/hooks/use-batch-enrich-by-filter'
import { useContacts } from '@features/contacts/hooks/use-contacts'
import type { FilterGroups } from '@shared/lib/utils/filter'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactsBulkAnalyzeModal({ open, onOpenChange }: Props) {
  // draft = what the FilterBuilder edits; applied = what the count and the batch use.
  // Decoupling them avoids re-running the (costly) count query on every input change —
  // the count only refreshes when the user presses "Calcular total".
  const [filterGroups, setFilterGroups] = useState<FilterGroups>([])
  const [appliedFilters, setAppliedFilters] = useState<FilterGroups>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  useEffect(() => {
    if (open) {
      setFilterGroups([])
      setAppliedFilters([])
      setSelectedTemplateId('')
    }
  }, [open])

  const { data: templates, isLoading: isLoadingTemplates } = useGetAnalysisTemplates()
  const activeTemplates = templates?.filter((t) => t.isActive) ?? []

  // Count query keyed on appliedFilters only — does not react to draft edits.
  const { total: contactCount, isLoading: isCountLoading } = useContacts({
    page: 1,
    filterGroups: appliedFilters,
  })

  const { batchEnrichByFilter, isPending } = useBatchEnrichByFilter()

  const isStale = JSON.stringify(filterGroups) !== JSON.stringify(appliedFilters)

  async function handleConfirm() {
    if (!selectedTemplateId) return
    try {
      const result = await batchEnrichByFilter({ filterGroups: appliedFilters, templateId: selectedTemplateId })

      const lines: string[] = [`${result.count} contacto${result.count !== 1 ? 's' : ''} encolado${result.count !== 1 ? 's' : ''} para análisis.`]
      if (result.skipped && result.skipped > 0) {
        lines.push(`${result.skipped} ya tenían análisis para esta plantilla y fueron salteados.`)
      }
      if (result.exceededMax) {
        lines.push('Se alcanzó el límite máximo de encolado.')
      }

      toast.success(lines.join(' '))
      onOpenChange(false)
    } catch {
      toast.error('Error al iniciar el análisis masivo.')
    }
  }

  const counterLabel = isStale
    ? 'Calculá el total con los filtros actuales'
    : isCountLoading
      ? 'Calculando…'
      : `${contactCount} contacto${contactCount !== 1 ? 's' : ''} serán analizados`

  const canConfirm =
    !!selectedTemplateId && activeTemplates.length > 0 && !isStale && contactCount > 0 && !isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Analizar masivo</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <FilterBuilder
            schema={contactsFilterSchema}
            groups={filterGroups}
            onChange={setFilterGroups}
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">
              {counterLabel}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAppliedFilters(filterGroups)}
              disabled={!isStale || isCountLoading}
              className="shrink-0"
            >
              Calcular total
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[length:var(--ds-font-size-xs)] font-medium text-muted-foreground">
              Plantilla de análisis
            </label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
              disabled={isLoadingTemplates || isPending}
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

            {activeTemplates.length === 0 && !isLoadingTemplates && (
              <p className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">
                No hay plantillas activas. Creá una en Configuración → Plantillas.
              </p>
            )}
          </div>

          <p className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">
            Los que ya tienen análisis para la plantilla seleccionada serán salteados.
          </p>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            {isPending ? 'Encolando…' : 'Confirmar análisis'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
