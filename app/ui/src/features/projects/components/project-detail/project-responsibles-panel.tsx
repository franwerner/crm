import { useMemo, useState } from 'react'
import { Card, CardHeader, CardContent } from '@shared/ui/card'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { EntityCreateModal } from '@shared/ui/entity-create-modal'
import { EntityEditModal } from '@shared/ui/entity-edit-modal'
import { DeleteDialog } from '@shared/ui/delete-dialog'
import type { ProjectView, ResponsiblesRoleEnumKey } from '@shared/api/types/ProjectView'
import {
  makeResponsibleCreateForm,
  responsibleCreateFormSchema,
  responsibleCreateDefaultValues,
} from '@features/projects/constants/project-responsible.form'
import type { ResponsibleCreateFormValues } from '@features/projects/constants/project-responsible.form'
import {
  responsibleEditForm,
  responsibleEditFormSchema,
  getResponsibleEditDefaults,
} from '@features/projects/constants/project-responsible-edit.form'
import type { ResponsibleEditFormValues } from '@features/projects/constants/project-responsible-edit.form'

type Responsible = ProjectView['responsibles'][number]

type Props = {
  responsibles: ProjectView['responsibles']
  onAdd: (data: ResponsibleCreateFormValues) => Promise<void>
  onEdit: (userId: string, data: ResponsibleEditFormValues) => Promise<void>
  onDelete: (userId: string) => Promise<void>
  isAdding: boolean
  isUpdating: boolean
  isRemoving: boolean
  addError: string | null
  updateError: string | null
}

const roleLabel: Record<ResponsiblesRoleEnumKey, string> = {
  Lead: 'Líder',
  Member: 'Miembro',
}

const roleBadgeVariant: Record<ResponsiblesRoleEnumKey, 'primary' | 'neutral'> = {
  Lead: 'primary',
  Member: 'neutral',
}

export function ProjectResponsiblesPanel({
  responsibles,
  onAdd,
  onEdit,
  onDelete,
  isAdding,
  isUpdating,
  isRemoving,
  addError,
  updateError,
}: Props) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Responsible | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Responsible | null>(null)

  const existingUserIds = responsibles.map((r) => r.userId)
  const existingUserIdsKey = existingUserIds.join('|')
  const createDescriptor = useMemo(
    () => makeResponsibleCreateForm(existingUserIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existingUserIdsKey],
  )

  async function handleAdd(data: ResponsibleCreateFormValues) {
    await onAdd(data)
  }

  async function handleEdit(data: ResponsibleEditFormValues) {
    if (!editTarget) return
    await onEdit(editTarget.userId, data)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await onDelete(deleteTarget.userId)
    setDeleteTarget(null)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="text-[length:var(--ds-font-size-md)] font-semibold">Responsables</div>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3 w-3" />
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {responsibles.length === 0 ? (
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">
              Sin responsables asignados.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {responsibles.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 py-2">
                  <span className="text-[length:var(--ds-font-size-sm)] text-foreground">
                    {r.userName ?? r.userId}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={roleBadgeVariant[r.role]}>{roleLabel[r.role]}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => setEditTarget(r)} aria-label="Editar rol">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(r)} aria-label="Eliminar responsable">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <EntityCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Agregar responsable"
        description="Asignar un usuario como responsable del proyecto"
        descriptor={createDescriptor}
        schema={responsibleCreateFormSchema}
        defaultValues={responsibleCreateDefaultValues}
        onSubmit={handleAdd}
        isPending={isAdding}
        errorMessage={addError}
      />

      {editTarget && (
        <EntityEditModal
          open={editTarget !== null}
          onOpenChange={(open) => { if (!open) setEditTarget(null) }}
          title={`Editar rol${editTarget.userName ? ` — ${editTarget.userName}` : ''}`}
          description="Cambiar el rol del responsable"
          size="sm"
          descriptor={responsibleEditForm}
          schema={responsibleEditFormSchema}
          defaultValues={getResponsibleEditDefaults(editTarget.role)}
          onSubmit={handleEdit}
          isPending={isUpdating}
          errorMessage={updateError}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
          title="Eliminar responsable"
          content={
            <p className="text-[length:var(--ds-font-size-sm)] text-foreground">
              ¿Confirmás eliminar a <strong>{deleteTarget.userName ?? 'este usuario'}</strong> como responsable?
            </p>
          }
          onDeleted={handleDelete}
          isDeleting={isRemoving}
        />
      )}
    </>
  )
}
