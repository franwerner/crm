// eslint-disable-next-line boundaries/external
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@shared/ui/tabs'
import { ContactDataPanel } from './contact-data-panel'
import { ContactAddressPanel } from './contact-address-panel'
import { ContactProvenancePanel } from './contact-provenance-panel'
import { ContactChannelsPanel } from './contact-channels-panel'
import { ContactAssigneesPanel } from './contact-assignees-panel'
import { ContactStateHistory } from './contact-state-history'
import { ContactActivityTimeline } from './contact-activity-timeline'
import { ContactAnalysisTab } from './analysis/contact-analysis-tab'
import { CONTACT_TABS } from '@features/contacts/constants/contact-detail-tabs'
import type { ContactTab } from '@features/contacts/constants/contact-detail-tabs'
import type { ContactView } from '@shared/api/types/ContactView'
import type { ContactAssignmentListItem } from '@shared/api/types/ContactAssignmentListItem'
import type { ContactEventView } from '@shared/api/types/ContactEventView'
import type { ContactStateChangeView } from '@shared/api/types/ContactStateChangeView'
import type { UpdateContactBody } from '@shared/api/types/UpdateContactBody'
import type { ChannelCreateFormValues } from '@features/contacts/constants/contact-channel.form'
import type { ChannelEditFormValues } from '@features/contacts/constants/contact-channel-edit.form'
import type { AssigneeCreateFormValues } from '@features/contacts/constants/contact-assignee.form'
import type { AssigneeEditFormValues } from '@features/contacts/constants/contact-assignee-edit.form'

const TAB_LABELS: Record<ContactTab, string> = {
  overview: 'Visión general',
  analysis: 'Análisis',
}

type Props = {
  contact: ContactView
  // Cross-tab mutation: updateContact is used by both data and address panels so it stays in the root view.
  onPatch: (partial: Partial<UpdateContactBody>) => void
  isUpdatingContact: boolean
  updateContactError: string | null

  // Channel props — scoped to overview tab but mutation originates in root view.
  onAddChannel: (data: ChannelCreateFormValues) => Promise<void>
  onEditChannel: (channelId: string, data: ChannelEditFormValues) => Promise<void>
  onRemoveChannel: (channelId: string) => Promise<void>
  isAddingChannel: boolean
  isUpdatingChannel: boolean
  isRemovingChannel: boolean
  addChannelError: string | null
  updateChannelError: string | null

  // Assignments — scoped to overview tab but mutation stays in root view.
  assignments: ContactAssignmentListItem[]
  isLoadingAssignments: boolean
  onAddAssignment: (data: AssigneeCreateFormValues) => Promise<void>
  onEditAssignment: (userId: string, data: AssigneeEditFormValues) => Promise<void>
  onRemoveAssignment: (userId: string) => Promise<void>
  isAddingAssignment: boolean
  isUpdatingAssignment: boolean
  isRemovingAssignment: boolean
  addAssignmentError: string | null
  updateAssignmentError: string | null

  // State changes and events — scoped to overview tab.
  stateChanges: ContactStateChangeView[]
  events: ContactEventView[]
  totalEvents: number
  isLoadingEvents: boolean
}

export function ContactDetailTabs({
  contact,
  onPatch,
  isUpdatingContact,
  updateContactError,
  onAddChannel,
  onEditChannel,
  onRemoveChannel,
  isAddingChannel,
  isUpdatingChannel,
  isRemovingChannel,
  addChannelError,
  updateChannelError,
  assignments,
  isLoadingAssignments,
  onAddAssignment,
  onEditAssignment,
  onRemoveAssignment,
  isAddingAssignment,
  isUpdatingAssignment,
  isRemovingAssignment,
  addAssignmentError,
  updateAssignmentError,
  stateChanges,
  events,
  totalEvents,
  isLoadingEvents,
}: Props) {
  const { tab } = useSearch({ from: '/_authenticated/contacts/$id' })
  const navigate = useNavigate({ from: '/contacts/$id' })

  function handleTabChange(value: string) {
    navigate({ search: (prev) => ({ ...prev, tab: value as ContactTab }), replace: false })
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <TabsList>
        {CONTACT_TABS.map((key) => (
          <TabsTrigger key={key} value={key}>
            {TAB_LABELS[key]}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview">
        <div className="flex flex-col gap-6 pt-2">
          <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <ContactDataPanel
                contact={contact}
                onPatch={onPatch}
                isPending={isUpdatingContact}
              />
              <ContactAddressPanel
                contact={contact}
                onPatch={onPatch}
                isPending={isUpdatingContact}
              />
              <ContactProvenancePanel contact={contact} />
            </div>

            <div className="flex flex-col gap-6">
              <ContactAssigneesPanel
                assignments={assignments}
                isLoading={isLoadingAssignments}
                onAdd={onAddAssignment}
                onEdit={onEditAssignment}
                onRemove={onRemoveAssignment}
                isAdding={isAddingAssignment}
                isUpdating={isUpdatingAssignment}
                isRemoving={isRemovingAssignment}
                addError={addAssignmentError}
                updateError={updateAssignmentError}
              />
              <ContactChannelsPanel
                channels={contact.channels}
                onAdd={onAddChannel}
                onEdit={onEditChannel}
                onRemove={onRemoveChannel}
                isAdding={isAddingChannel}
                isUpdating={isUpdatingChannel}
                isRemoving={isRemovingChannel}
                addError={addChannelError}
                updateError={updateChannelError}
              />
              <ContactStateHistory stateChanges={stateChanges} />
            </div>
          </div>

          {updateContactError && (
            <p className="text-[length:var(--ds-font-size-sm)] text-destructive">{updateContactError}</p>
          )}

          <ContactActivityTimeline
            events={events}
            total={totalEvents}
            isLoading={isLoadingEvents}
          />
        </div>
      </TabsContent>

      <TabsContent value="analysis">
        <div className="pt-2">
          <ContactAnalysisTab contactId={contact.id} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
