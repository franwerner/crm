import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { EntityCreateModal } from '@shared/ui/entity-create-modal'
import { EntityEditModal } from '@shared/ui/entity-edit-modal'
import { DeleteDialog } from '@shared/ui/delete-dialog'
import type { ProjectExtensionView } from '@shared/api/types/ProjectExtensionView'
import {
  extensionCreateForm,
  extensionCreateFormSchema,
  extensionCreateDefaultValues,
} from '@features/projects/constants/project-extension.form'
import type { ExtensionCreateFormValues } from '@features/projects/constants/project-extension.form'
import {
  extensionEditForm,
  extensionEditFormSchema,
  getExtensionEditDefaults,
} from '@features/projects/constants/project-extension-edit.form'
import type { ExtensionEditFormValues } from '@features/projects/constants/project-extension-edit.form'
import { formatDate } from '@shared/lib/utils/date'

type Props = {
  extensions: ProjectExtensionView[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  onPageChange: (page: number) => void
  currency: string
  onAdd: (data: ExtensionCreateFormValues) => Promise<void>
  onEdit: (extId: string, data: ExtensionEditFormValues) => Promise<void>
  onDelete: (extId: string) => Promise<void>
  isAdding: boolean
  isUpdating: boolean
  isRemoving: boolean
  addError: string | null
  updateError: string | null
}

function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinor / 100)
}

export function ProjectExtensionsPanel({
  extensions,
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
  currency,
  onAdd,
  onEdit,
  onDelete,
  isAdding,
  isUpdating,
  isRemoving,
  addError,
  updateError,
}: Props) {
  const totalPages = Math.ceil(total / pageSize)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ProjectExtensionView | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectExtensionView | null>(null)

  async function handleAdd(data: ExtensionCreateFormValues) {
    await onAdd(data)
  }

  async function handleEdit(data: ExtensionEditFormValues) {
    if (!editTarget) return
    await onEdit(editTarget.id, data)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await onDelete(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-[length:var(--ds-font-size-md)]">Extensiones</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3 w-3" />
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">Cargando…</p>
          ) : extensions.length === 0 ? (
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">
              Sin extensiones registradas.
            </p>
          ) : (
            <>
              <ul className="flex flex-col divide-y divide-border">
                {extensions.map((ext) => (
                  <li key={ext.id} className="py-3 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[length:var(--ds-font-size-sm)] font-medium text-foreground">
                        +{ext.additionalDays} días
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">
                          {formatDate(ext.grantedAt)}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setEditTarget(ext)} aria-label="Editar extensión">
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(ext)} aria-label="Eliminar extensión">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">{ext.reason}</span>
                    <div className="flex items-center gap-4 text-[length:var(--ds-font-size-xs)] text-muted-foreground">
                      <span>Fin aplicado: {formatDate(ext.appliedEndDate)}</span>
                      {ext.cost !== null && (
                        <span>Costo: {formatMoney(ext.cost, currency)}</span>
                      )}
                      {ext.billedAmount !== null && (
                        <span>Facturado: {formatMoney(ext.billedAmount, currency)}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
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

      <EntityCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Agregar extensión"
        description="Agregar una extensión de tiempo al proyecto"
        descriptor={extensionCreateForm}
        schema={extensionCreateFormSchema}
        defaultValues={extensionCreateDefaultValues}
        onSubmit={handleAdd}
        isPending={isAdding}
        errorMessage={addError}
      />

      {editTarget && (
        <EntityEditModal
          open={editTarget !== null}
          onOpenChange={(open) => { if (!open) setEditTarget(null) }}
          title="Editar extensión"
          description="Modificar los datos de la extensión"
          descriptor={extensionEditForm}
          schema={extensionEditFormSchema}
          defaultValues={getExtensionEditDefaults(editTarget)}
          onSubmit={handleEdit}
          isPending={isUpdating}
          errorMessage={updateError}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
          title="Eliminar extensión"
          content={
            <p className="text-[length:var(--ds-font-size-sm)] text-foreground">
              ¿Confirmás eliminar la extensión de <strong>{deleteTarget.additionalDays} día{deleteTarget.additionalDays !== 1 ? 's' : ''}</strong>?
            </p>
          }
          onDeleted={handleDelete}
          isDeleting={isRemoving}
        />
      )}
    </>
  )
}
