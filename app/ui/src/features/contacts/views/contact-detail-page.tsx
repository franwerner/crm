import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useContact, useContactEvents, useContactStateChanges } from '@features/contacts/hooks/use-contact'
import {
  useRegisterContactEvent,
  useAddChannel,
  useUpdateChannel,
  useRemoveChannel,
  useUpdateContact,
} from '@features/contacts/hooks/use-contact-mutations'
import {
  useContactAssignments,
  useAddAssignment,
  useUpdateAssignmentRole,
  useRemoveAssignment,
} from '@features/contacts/hooks/use-contact-assignments'
import { ContactDetailHeader } from '../components/contact-detail/contact-detail-header'
import { ContactDetailTabs } from '../components/contact-detail/contact-detail-tabs'
import { RegisterEventModal } from '@features/contacts/components/contact-detail/register-event-modal'
import type { RegisterEventBody } from '@shared/api/types/RegisterEventBody'
import type { AddChannelBodyChannelTypeEnumKey } from '@shared/api/types/AddChannelBody'
import type { UpdateChannelBodyChannelTypeEnumKey } from '@shared/api/types/UpdateChannelBody'
import type { ChannelCreateFormValues } from '@features/contacts/constants/contact-channel.form'
import type { ChannelEditFormValues } from '@features/contacts/constants/contact-channel-edit.form'
import type { AssigneeCreateFormValues } from '@features/contacts/constants/contact-assignee.form'
import type { AssigneeEditFormValues } from '@features/contacts/constants/contact-assignee-edit.form'

export function ContactDetailPage() {
  const { id } = useParams({ from: '/_authenticated/contacts/$id' })

  // These hooks fetch data consumed across multiple tabs and must stay at the root view.
  const { contact, isLoading } = useContact(id)
  const { events, total, isLoading: isLoadingEvents } = useContactEvents(id)
  const { stateChanges } = useContactStateChanges(id)

  // updateContact is used by ContactDataPanel and ContactAddressPanel (both in overview tab);
  // keeping it here avoids prop-drilling through the tabs container.
  const { updateContact, isPending: isUpdatingContact, errorMessage: updateContactError } = useUpdateContact(id)
  const { registerEvent, isPending: isRegistering, errorMessage: registerError } = useRegisterContactEvent(id)
  const { addChannel, isPending: isAdding, errorMessage: addError } = useAddChannel(id)
  const { updateChannel, isPending: isUpdatingChannel, errorMessage: updateError } = useUpdateChannel(id)
  const { removeChannel, isPending: isRemoving } = useRemoveChannel(id)

  const { assignments, isLoading: isLoadingAssignments } = useContactAssignments(id)
  const { addAssignment, isPending: isAddingAssignment, errorMessage: addAssignmentError } = useAddAssignment(id)
  const { updateAssignmentRole, isPending: isUpdatingAssignment, errorMessage: updateAssignmentError } = useUpdateAssignmentRole(id)
  const { removeAssignment, isPending: isRemovingAssignment } = useRemoveAssignment(id)

  const [registerOpen, setRegisterOpen] = useState(false)

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

  return (
    <>
      <div className="flex flex-col gap-6">
        <ContactDetailHeader
          contact={contact}
          onRegisterEvent={() => setRegisterOpen(true)}
        />

        <ContactDetailTabs
          contact={contact}
          onPatch={updateContact}
          isUpdatingContact={isUpdatingContact}
          updateContactError={updateContactError}
          onAddChannel={handleAddChannel}
          onEditChannel={handleEditChannel}
          onRemoveChannel={handleRemoveChannel}
          isAddingChannel={isAdding}
          isUpdatingChannel={isUpdatingChannel}
          isRemovingChannel={isRemoving}
          addChannelError={addError}
          updateChannelError={updateError}
          assignments={assignments}
          isLoadingAssignments={isLoadingAssignments}
          onAddAssignment={handleAddAssignment}
          onEditAssignment={handleEditAssignment}
          onRemoveAssignment={removeAssignment}
          isAddingAssignment={isAddingAssignment}
          isUpdatingAssignment={isUpdatingAssignment}
          isRemovingAssignment={isRemovingAssignment}
          addAssignmentError={addAssignmentError}
          updateAssignmentError={updateAssignmentError}
          stateChanges={stateChanges}
          events={events}
          totalEvents={total}
          isLoadingEvents={isLoadingEvents}
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
    </>
  )
}
