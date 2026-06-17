import { useState } from 'react'
import { Plus, Download, Play } from 'lucide-react'
import { PanelCard } from '@shared/ui/panel-card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { useImports } from '@features/imports/hooks/use-imports'
import { getImportStatusBadge } from '@features/imports/constants/import-status-badge'
import { ImportWizard } from '@features/imports/components/import-wizard/import-wizard'
import type { ImportListItem } from '@features/imports/hooks/use-imports'

interface ImportRowProps {
  item: ImportListItem
  onResume: (id: string) => void
}

function ImportRow({ item, onResume }: ImportRowProps) {
  const badge = getImportStatusBadge(item.status)
  const progressPct =
    item.totalRows && item.totalRows > 0
      ? Math.round((item.processedRows / item.totalRows) * 100)
      : null

  return (
    <li className="flex flex-col gap-2 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[length:var(--ds-font-size-sm)] font-[var(--ds-font-weight-semibold)] text-foreground">
            {item.id}
          </span>
          <span className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">
            {item.processedRows}
            {item.totalRows != null ? ` / ${item.totalRows}` : ''} filas procesadas
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={badge.variant}>{badge.label}</Badge>

          {/* Resume wizard at the mapping step for imports that are awaiting column mapping */}
          {item.status === 'awaiting_mapping' && (
            <Button
              variant="ghost"
              size="icon"
              title="Continuar mapeo"
              onClick={() => onResume(item.id)}
            >
              <Play className="size-4" />
            </Button>
          )}

          {/* Only show download when there are rejected rows with a CSV URL */}
          {item.rejectedCsvUrl && item.failedCount > 0 && (
            <a href={item.rejectedCsvUrl} download="rejected.csv">
              <Button variant="ghost" size="icon" title="Descargar rechazados">
                <Download className="size-4" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {progressPct != null && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </li>
  )
}

export function ImportsPage() {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [resumeImportId, setResumeImportId] = useState<string | null>(null)
  const { imports, isLoading, isError, refetch } = useImports()

  function handleNewImport() {
    setResumeImportId(null)
    setWizardOpen(true)
  }

  function handleResumeImport(id: string) {
    setResumeImportId(id)
    setWizardOpen(true)
  }

  function handleWizardOpenChange(open: boolean) {
    setWizardOpen(open)
    if (!open) {
      setResumeImportId(null)
      refetch()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[length:var(--ds-font-size-xl)] font-[var(--ds-font-weight-semibold)] text-foreground">
          Ingestas
        </h1>
        <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">
          Importá contactos desde archivos Excel.
        </p>
      </div>

      <PanelCard
        title="Historial de ingestas"
        action={
          <Button variant="default" size="sm" onClick={handleNewImport}>
            <Plus />
            Nueva ingesta
          </Button>
        }
      >
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-md border border-border bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-[length:var(--ds-font-size-sm)] text-destructive">
              No se pudo cargar el historial de ingestas.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : imports.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-2">
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">
              No hay ingestas todavía.
            </p>
            <Button variant="outline" size="sm" onClick={handleNewImport}>
              <Plus />
              Crear la primera ingesta
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {imports.map((item) => (
              <ImportRow key={item.id} item={item} onResume={handleResumeImport} />
            ))}
          </ul>
        )}
      </PanelCard>

      <ImportWizard
        open={wizardOpen}
        onOpenChange={handleWizardOpenChange}
        resumeImportId={resumeImportId}
      />
    </div>
  )
}
