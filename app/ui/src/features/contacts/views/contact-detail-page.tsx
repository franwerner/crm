import { useState } from 'react'
import { toast } from 'sonner'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useContact, useContactEvents, useContactStateChanges } from '@features/contacts/hooks/use-contact'
import {
  useRegisterContactEvent,
  useAddChannel,
  useUpdateChannel,
  useRemoveChannel,
  useUpdateContact,
  useBulkDeleteContacts,
} from '@features/contacts/hooks/use-contact-mutations'
import { DeleteDialog } from '@shared/ui/delete-dialog'
import {
  useContactAssignments,
  useAddAssignment,
  useUpdateAssignmentRole,
  useRemoveAssignment,
} from '@features/contacts/hooks/use-contact-assignments'
import { ContactDataPanel } from '@features/contacts/components/contact-detail/contact-data-panel'
import { ContactAddressPanel } from '@features/contacts/components/contact-detail/contact-address-panel'
import { ContactProvenancePanel } from '@features/contacts/components/contact-detail/contact-provenance-panel'
import { ContactChannelsPanel } from '@features/contacts/components/contact-detail/contact-channels-panel'
import { ContactAssigneesPanel } from '@features/contacts/components/contact-detail/contact-assignees-panel'
import { ContactStateHistory } from '@features/contacts/components/contact-detail/contact-state-history'
import { ContactActivityTimeline } from '@features/contacts/components/contact-detail/contact-activity-timeline'
import { RegisterEventModal } from '@features/contacts/components/contact-detail/register-event-modal'
import type { RegisterEventBody } from '@shared/api/types/RegisterEventBody'
import type { AddChannelBodyChannelTypeEnumKey } from '@shared/api/types/AddChannelBody'
import type { UpdateChannelBodyChannelTypeEnumKey } from '@shared/api/types/UpdateChannelBody'
import type { ChannelCreateFormValues } from '@features/contacts/constants/contact-channel.form'
import type { ChannelEditFormValues } from '@features/contacts/constants/contact-channel-edit.form'
import type { AssigneeCreateFormValues } from '@features/contacts/constants/contact-assignee.form'
import type { AssigneeEditFormValues } from '@features/contacts/constants/contact-assignee-edit.form'
import { ContactDetailHeader } from '../components/contact-detail/contact-detail-header'

export function ContactDetailPage() {
  const { id } = useParams({ from: '/_authenticated/contacts/$id' })
  const navigate = useNavigate()

  const { contact, isLoading } = useContact(id)
  const { events, total, isLoading: isLoadingEvents } = useContactEvents(id)
  const { stateChanges } = useContactStateChanges(id)

  const { updateContact, isPending: isUpdatingContact, errorMessage: updateContactError } = useUpdateContact(id)
  const { registerEvent, isPending: isRegistering, errorMessage: registerError } = useRegisterContactEvent(id)
  const { addChannel, isPending: isAdding, errorMessage: addError } = useAddChannel(id)
  const { updateChannel, isPending: isUpdatingChannel, errorMessage: updateError } = useUpdateChannel(id)
  const { removeChannel, isPending: isRemoving } = useRemoveChannel(id)
  const { bulkDelete, isPending: isDeleting } = useBulkDeleteContacts()

  const { assignments, isLoading: isLoadingAssignments } = useContactAssignments(id)
  const { addAssignment, isPending: isAddingAssignment, errorMessage: addAssignmentError } = useAddAssignment(id)
  const { updateAssignmentRole, isPending: isUpdatingAssignment, errorMessage: updateAssignmentError } = useUpdateAssignmentRole(id)
  const { removeAssignment, isPending: isRemovingAssignment } = useRemoveAssignment(id)

  const [registerOpen, setRegisterOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-muted-foreground text-[length:var(--ds-font-size-sm)]">Cargando…</span>
      </div>
    )
  }

  if (!contact) {
    return null
  }

  async function handleRegisterEvent(data: RegisterEventBody) {
    await registerEvent(data)
  }

  async function handleAddChannel(data: ChannelCreateFormValues) {
    await addChannel({
      channelType: data.channelType as AddChannelBodyChannelTypeEnumKey,
      value: data.value,
      isPrimary: data.isPrimary,
    })
  }

  async function handleEditChannel(channelId: string, data: ChannelEditFormValues) {
    await updateChannel(channelId, {
      channelType: data.channelType as UpdateChannelBodyChannelTypeEnumKey,
      value: data.value,
      isPrimary: data.isPrimary,
    })
  }

  async function handleRemoveChannel(channelId: string) {
    await removeChannel(channelId)
  }

  async function handleAddAssignment(data: AssigneeCreateFormValues) {
    await addAssignment({ userId: data.userId, role: data.role })
  }

  async function handleEditAssignment(userId: string, data: AssigneeEditFormValues) {
    await updateAssignmentRole(userId, { role: data.role })
  }

  async function handleConfirmDelete() {
    try {
      await bulkDelete([id])
      setDeleteOpen(false)
      navigate({ to: '/contacts' })
    } catch {
      toast.error('Error al eliminar el contacto')
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <ContactDetailHeader
          contact={contact}
          onRegisterEvent={() => setRegisterOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />

        <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <ContactDataPanel
              contact={contact}
              onPatch={updateContact}
              isPending={isUpdatingContact}
            />
            <ContactAddressPanel
              contact={contact}
              onPatch={updateContact}
              isPending={isUpdatingContact}
            />
            <ContactProvenancePanel contact={contact} />
          </div>

          <div className="flex flex-col gap-6">
            <ContactAssigneesPanel
              assignments={assignments}
              isLoading={isLoadingAssignments}
              onAdd={handleAddAssignment}
              onEdit={handleEditAssignment}
              onRemove={removeAssignment}
              isAdding={isAddingAssignment}
              isUpdating={isUpdatingAssignment}
              isRemoving={isRemovingAssignment}
              addError={addAssignmentError}
              updateError={updateAssignmentError}
            />
            <ContactChannelsPanel
              channels={contact.channels}
              onAdd={handleAddChannel}
              onEdit={handleEditChannel}
              onRemove={handleRemoveChannel}
              isAdding={isAdding}
              isUpdating={isUpdatingChannel}
              isRemoving={isRemoving}
              addError={addError}
              updateError={updateError}
            />
            <ContactStateHistory stateChanges={stateChanges} />
          </div>
        </div>

        {updateContactError && (
          <p className="text-[length:var(--ds-font-size-sm)] text-destructive">{updateContactError}</p>
        )}

        <ContactActivityTimeline
          events={events}
          total={total}
          isLoading={isLoadingEvents}
        />
      </div>

      <RegisterEventModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSubmit={handleRegisterEvent}
        isPending={isRegistering}
        errorMessage={registerError}
        pipelineState={contact.pipelineState}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar contacto"
        content={`¿Eliminar a ${contact.name}? Esta acción no se puede deshacer.`}
        onDeleted={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}
