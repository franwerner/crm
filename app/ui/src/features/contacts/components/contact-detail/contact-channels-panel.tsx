import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import type { ContactView } from '@shared/api/types/ContactView'
import { channelTypeLabels } from '@features/contacts/constants/contacts.options'
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { EntityCreateModal } from '@shared/ui/entity-create-modal'
import { EntityEditModal } from '@shared/ui/entity-edit-modal'
import { DeleteDialog } from '@shared/ui/delete-dialog'
import {
  channelCreateForm,
  channelCreateFormSchema,
  channelCreateDefaultValues,
} from '@features/contacts/constants/contact-channel.form'
import type { ChannelCreateFormValues } from '@features/contacts/constants/contact-channel.form'
import {
  channelEditForm,
  channelEditFormSchema,
  getChannelEditDefaults,
} from '@features/contacts/constants/contact-channel-edit.form'
import type { ChannelEditFormValues } from '@features/contacts/constants/contact-channel-edit.form'

export type ChannelView = ContactView['channels'][number]

type Props = {
  channels: ChannelView[]
  onAdd: (data: ChannelCreateFormValues) => Promise<void>
  onEdit: (channelId: string, data: ChannelEditFormValues) => Promise<void>
  onRemove: (channelId: string) => Promise<void>
  isAdding: boolean
  isUpdating: boolean
  isRemoving: boolean
  addError: string | null
  updateError: string | null
}

export function ContactChannelsPanel({
  channels,
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
  const [editTarget, setEditTarget] = useState<ChannelView | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ChannelView | null>(null)

  async function handleAdd(data: ChannelCreateFormValues) {
    await onAdd(data)
  }

  async function handleEdit(data: ChannelEditFormValues) {
    if (!editTarget) return
    await onEdit(editTarget.id, data)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await onRemove(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-[length:var(--ds-font-size-md)]">Canales</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3 w-3" />
              Agregar
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {channels.length === 0 ? (
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">
              Sin canales registrados.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {channels.map((ch) => (
                <li key={ch.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[length:var(--ds-font-size-xs)] text-muted-foreground">
                      {channelTypeLabels[ch.channelType] ?? ch.channelType}
                    </span>
                    <span className="truncate text-[length:var(--ds-font-size-sm)] text-foreground">
                      {ch.value}
                    </span>
                    {ch.isPrimary && (
                      <span className="shrink-0 rounded-full border-[1.5px] border-brand bg-primary px-2 py-0.5 text-[length:var(--ds-font-size-xs)] font-medium text-primary-foreground">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditTarget(ch)} aria-label="Editar canal">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(ch)} aria-label="Eliminar canal">
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
        title="Agregar canal"
        description="Agregar un canal de contacto"
        descriptor={channelCreateForm}
        schema={channelCreateFormSchema}
        defaultValues={channelCreateDefaultValues}
        onSubmit={handleAdd}
        isPending={isAdding}
        errorMessage={addError}
      />

      {editTarget && (
        <EntityEditModal
          open={editTarget !== null}
          onOpenChange={(open) => { if (!open) setEditTarget(null) }}
          title="Editar canal"
          description="Modificar los datos del canal"
          descriptor={channelEditForm}
          schema={channelEditFormSchema}
          defaultValues={getChannelEditDefaults(editTarget)}
          onSubmit={handleEdit}
          isPending={isUpdating}
          errorMessage={updateError}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
          title="Eliminar canal"
          content={
            <p className="text-[length:var(--ds-font-size-sm)] text-foreground">
              ¿Confirmás eliminar el canal <strong>{deleteTarget.value}</strong>?
            </p>
          }
          onDeleted={handleDelete}
          isDeleting={isRemoving}
        />
      )}
    </>
  )
}
