import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import type { ProjectDocumentView } from '@shared/api/types/ProjectDocumentView'
import { formatDateTime } from '@shared/lib/utils/date'

type Props = {
  documents: ProjectDocumentView[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  onPageChange: (page: number) => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ProjectDocumentsPanel({
  documents,
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
}: Props) {
  const totalPages = Math.ceil(total / pageSize)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[length:var(--ds-font-size-md)]">Documentos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">Cargando…</p>
        ) : documents.length === 0 ? (
          <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">
            Sin documentos adjuntos.
          </p>
        ) : (
          <>
            <table className="w-full text-[length:var(--ds-font-size-sm)]">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-medium text-muted-foreground">Archivo</th>
                  <th className="py-2 text-left font-medium text-muted-foreground">Tipo</th>
                  <th className="py-2 text-right font-medium text-muted-foreground">Tamaño</th>
                  <th className="py-2 text-right font-medium text-muted-foreground">Subido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="py-2 text-foreground">{doc.fileName}</td>
                    <td className="py-2 text-muted-foreground">{doc.contentType}</td>
                    <td className="py-2 text-right text-muted-foreground">{formatBytes(doc.sizeBytes)}</td>
                    <td className="py-2 text-right text-muted-foreground">{formatDateTime(doc.uploadedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3">
                <span className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">
                  Pág. {page} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
