import { useState } from 'react'
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
import { useBatchEnrichByFilter } from '@features/contacts/hooks/use-batch-enrich-by-filter'
import type { FilterGroups } from '@shared/lib/utils/filter'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filteredCount: number
  filterGroups: FilterGroups
  search?: string
}

export function ContactsBulkAnalyzeModal({
  open,
  onOpenChange,
  filteredCount,
  filterGroups,
  search,
}: Props) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  const { data: templates, isLoading: isLoadingTemplates } = useGetAnalysisTemplates()
  const activeTemplates = templates?.filter((t) => t.isActive) ?? []

  const { batchEnrichByFilter, isPending } = useBatchEnrichByFilter()

  async function handleConfirm() {
    if (!selectedTemplateId) return
    try {
      const result = await batchEnrichByFilter({ filterGroups, search, templateId: selectedTemplateId })

      const lines: string[] = [`${result.count} contacto${result.count !== 1 ? 's' : ''} encolado${result.count !== 1 ? 's' : ''} para análisis.`]
      if (result.skipped && result.skipped > 0) {
        lines.push(`${result.skipped} ya tenían análisis para esta plantilla y fueron salteados.`)
      }
      if (result.exceededMax) {
        lines.push('Se alcanzó el límite máximo de encolado.')
      }

      toast.success(lines.join(' '))
      onOpenChange(false)
      setSelectedTemplateId('')
    } catch {
      toast.error('Error al iniciar el análisis masivo.')
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setSelectedTemplateId('')
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Analizar {filteredCount} contacto{filteredCount !== 1 ? 's' : ''} filtrado{filteredCount !== 1 ? 's' : ''}</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <p className="text-[length:var(--ds-font-size-sm)]">
            Se encolará el análisis LLM para los <strong>{filteredCount}</strong> contacto{filteredCount !== 1 ? 's' : ''} que coinciden con el filtro activo.
            Los que ya tienen análisis para la plantilla seleccionada serán salteados.
          </p>

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
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={!selectedTemplateId || isPending || activeTemplates.length === 0}
          >
            {isPending ? 'Encolando…' : 'Confirmar análisis'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
