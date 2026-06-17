import { Loader2 } from 'lucide-react'
import { useImportStatus } from '@features/imports/hooks/use-import-status'
import { getImportStatusBadge } from '@features/imports/constants/import-status-badge'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'

interface ProcessingStepProps {
  importId: string
  onClose: () => void
}

export function ProcessingStep({ importId, onClose }: ProcessingStepProps) {
  const { importStatus, isLoading, isError } = useImportStatus(importId)

  const isTerminal =
    importStatus?.status === 'completed' || importStatus?.status === 'failed'

  const statusBadge = importStatus ? getImportStatusBadge(importStatus.status) : null

  // Progress percentage — null while totalRows is unknown
  const progressPct =
    importStatus?.totalRows && importStatus.totalRows > 0
      ? Math.round((importStatus.processedRows / importStatus.totalRows) * 100)
      : null

  if (isLoading && !importStatus) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-[length:var(--ds-font-size-sm)] text-destructive">
        No se pudo obtener el estado de la ingesta.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        {statusBadge && <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>}
        {!isTerminal && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>

      {importStatus && (
        <>
          {/* Progress bar using processedRows / totalRows */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[length:var(--ds-font-size-xs)] text-muted-foreground">
              <span>Progreso</span>
              <span>
                {importStatus.processedRows}
                {importStatus.totalRows != null ? ` / ${importStatus.totalRows}` : ''} filas
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: progressPct != null ? `${progressPct}%` : '0%' }}
              />
            </div>
          </div>

          {isTerminal && (
            <ul className="flex flex-col gap-1 text-[length:var(--ds-font-size-sm)]">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Importados</span>
                <span className="font-[var(--ds-font-weight-semibold)]">{importStatus.okCount}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Duplicados</span>
                <span className="font-[var(--ds-font-weight-semibold)]">{importStatus.duplicatedCount}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Rechazados</span>
                <span className="font-[var(--ds-font-weight-semibold)]">{importStatus.failedCount}</span>
              </li>
            </ul>
          )}

          {importStatus.rejectedCsvUrl && (
            <a
              href={importStatus.rejectedCsvUrl}
              download="rejected.csv"
              className="inline-flex w-fit items-center gap-1.5 text-[length:var(--ds-font-size-sm)] text-primary underline hover:no-underline"
            >
              Descargar rechazados (.csv)
            </a>
          )}
        </>
      )}

      {isTerminal && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      )}
    </div>
  )
}
