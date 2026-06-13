import { useMemo, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { PanelCard } from '@shared/ui/panel-card'
import { Button } from '@shared/ui/button'
import { Avatar } from '@shared/ui/avatar'
import { Badge } from '@shared/ui/badge'
import { EntityCreateModal } from '@shared/ui/entity-create-modal'
import { EntityEditModal } from '@shared/ui/entity-edit-modal'
import { DeleteDialog } from '@shared/ui/delete-dialog'
import type { ContactAssignmentListItem, ContactAssignmentListItemRoleEnumKey } from '@shared/api/types/ContactAssignmentListItem'
import {
  makeAssigneeCreateForm,
  assigneeCreateFormSchema,
  assigneeCreateDefaultValues,
} from '@features/contacts/constants/contact-assignee.form'
import type { AssigneeCreateFormValues } from '@features/contacts/constants/contact-assignee.form'
import {
  assigneeEditForm,
  assigneeEditFormSchema,
  getAssigneeEditDefaults,
} from '@features/contacts/constants/contact-assignee-edit.form'
import type { AssigneeEditFormValues } from '@features/contacts/constants/contact-assignee-edit.form'

const roleLabel: Record<ContactAssignmentListItemRoleEnumKey, string> = {
  Owner: 'Responsable',
  Collaborator: 'Colaborador',
}

const roleBadgeVariant: Record<ContactAssignmentListItemRoleEnumKey, 'primary' | 'neutral'> = {
  Owner: 'primary',
  Collaborator: 'neutral',
}

type Props = {
  assignments: ContactAssignmentListItem[]
  isLoading: boolean
  onAdd: (data: AssigneeCreateFormValues) => Promise<void>
  onEdit: (userId: string, data: AssigneeEditFormValues) => Promise<void>
  onRemove: (userId: string) => Promise<void>
  isAdding: boolean
  isUpdating: boolean
  isRemoving: boolean
  addError: string | null
  updateError: string | null
}

export function ContactAssigneesPanel({
  assignments,
  isLoading,
  onAdd,
  onEdit,
  onRemove,
  isAdding,
  isUpdating,
  isRemoving,
  addError,
  updateError,
}: Props) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ContactAssignmentListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContactAssignmentListItem | null>(null)

  const existingUserIds = assignments.map((a) => a.userId)
  const existingUserIdsKey = existingUserIds.join('|')
  const createDescriptor = useMemo(
    () => makeAssigneeCreateForm(existingUserIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existingUserIdsKey],
  )

  async function handleAdd(data: AssigneeCreateFormValues) {
    await onAdd(data)
  }

  async function handleEdit(data: AssigneeEditFormValues) {
    if (!editTarget) return
    await onEdit(editTarget.userId, data)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await onRemove(deleteTarget.userId)
    setDeleteTarget(null)
  }

  return (
    <>
      <PanelCard
        title="Asignados"
        action={
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3 w-3" />
            Agregar
          </Button>
        }
      >
          {isLoading ? (
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">Cargando…</p>
          ) : assignments.length === 0 ? (
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">
              Sin asignados.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {assignments.map((a) => (
                <li key={a.userId} className="flex items-center justify-between gap-3 py-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Avatar name={a.userName} size="sm" />
                    <span className="truncate text-[length:var(--ds-font-size-sm)] text-foreground">
                      {a.userName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={roleBadgeVariant[a.role]}>{roleLabel[a.role]}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => setEditTarget(a)} aria-label="Editar rol">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(a)} aria-label="Eliminar asignado">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
      </PanelCard>

      <EntityCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Asignar usuario"
        description="Asignar un usuario al contacto"
        descriptor={createDescriptor}
        schema={assigneeCreateFormSchema}
        defaultValues={assigneeCreateDefaultValues}
        onSubmit={handleAdd}
        isPending={isAdding}
        errorMessage={addError}
      />

      {editTarget && (
        <EntityEditModal
          open={editTarget !== null}
          onOpenChange={(open) => { if (!open) setEditTarget(null) }}
          title={`Editar rol${editTarget.userName ? ` — ${editTarget.userName}` : ''}`}
          description="Cambiar el rol del asignado"
          size="sm"
          descriptor={assigneeEditForm}
          schema={assigneeEditFormSchema}
          defaultValues={getAssigneeEditDefaults(editTarget.role)}
          onSubmit={handleEdit}
          isPending={isUpdating}
          errorMessage={updateError}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
          title="Eliminar asignado"
          content={
            <p className="text-[length:var(--ds-font-size-sm)] text-foreground">
              ¿Confirmás quitar a <strong>{deleteTarget.userName}</strong> como asignado?
            </p>
          }
          onDeleted={handleDelete}
          isDeleting={isRemoving}
        />
      )}
    </>
  )
}
