import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { PanelCard } from '@shared/ui/panel-card'
import { Button } from '@shared/ui/button'
import { DeleteDialog } from '@shared/ui/delete-dialog'
import type { ProjectDocumentView } from '@shared/api/types/ProjectDocumentView'
import { formatDateTime } from '@shared/lib/utils/date'
import { FileUploadModal } from '@shared/ui/file-upload-modal'
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  DOCUMENT_TYPES_HINT,
} from '@features/projects/constants/project-documents'

type Props = {
  documents: ProjectDocumentView[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onUpload: (files: File[]) => Promise<void>
  isUploading: boolean
  uploadError: string | null
  onDelete: (docId: string) => Promise<void>
  isRemoving: boolean
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
  onUpload,
  isUploading,
  uploadError,
  onDelete,
  isRemoving,
}: Props) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProjectDocumentView | null>(null)
  const totalPages = Math.ceil(total / pageSize)

  async function handleDelete() {
    if (!deleteTarget) return
    await onDelete(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <>
      <PanelCard
        title="Documentos"
        action={
          <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
            <Plus className="h-3 w-3" />
            Agregar
          </Button>
        }
      >
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
                  <th className="py-2 text-right font-medium text-muted-foreground">Tamaño</th>
                  <th className="py-2 text-right font-medium text-muted-foreground">Subido</th>
                  <th className="py-2 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="py-2 text-foreground">{doc.fileName}</td>
                    <td className="py-2 text-right text-muted-foreground">{formatBytes(doc.sizeBytes)}</td>
                    <td className="py-2 text-right text-muted-foreground">{formatDateTime(doc.uploadedAt)}</td>
                    <td className="py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(doc)} aria-label="Eliminar documento">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </td>
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
      </PanelCard>

      <FileUploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        title="Agregar documentos"
        description="Subir documentos al proyecto"
        accept={[...ALLOWED_DOCUMENT_MIME_TYPES]}
        maxSizeBytes={MAX_DOCUMENT_SIZE_BYTES}
        multiple
        hint={DOCUMENT_TYPES_HINT}
        onUpload={onUpload}
        isPending={isUploading}
        errorMessage={uploadError}
      />

      {deleteTarget && (
        <DeleteDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
          title="Eliminar documento"
          content={
            <p className="text-[length:var(--ds-font-size-sm)] text-foreground">
              ¿Confirmás eliminar el documento <strong>{deleteTarget.fileName}</strong>?
            </p>
          }
          onDeleted={handleDelete}
          isDeleting={isRemoving}
        />
      )}
    </>
  )
}
