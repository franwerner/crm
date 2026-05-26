import type { PipelineState } from '@modules/contacts/domain/types/pipeline-state'
import type { SourceChannel } from '@modules/contacts/domain/types/source-channel'
import type { InterestLevel } from '@modules/contacts/domain/types/interest-level'
import type { ContactType } from '@modules/contacts/domain/types/contact-type'
import type { Sex } from '@modules/contacts/domain/types/sex'
import type { ChannelType } from '@modules/contacts/domain/types/channel-type'
import type { ContactAssignmentRole } from '@modules/contacts/domain/types/contact-assignment-role'
import type { ListQuery } from '@shared/types/filters'
import type { Page, PageParams } from '@shared/types/pagination'

export interface ContactKpiState {
  state: PipelineState
  current: number
  previous: number
}

export interface ContactKpisTotal {
  count: number
  current: number
  previous: number
}

export interface ContactKpisResult {
  total: ContactKpisTotal
  states: ContactKpiState[]
}

export interface ContactCreatorRef {
  id: string
  name: string
}

export interface ContactPrimaryChannel {
  channelType: ChannelType
  value: string
}

export interface ContactListItem {
  id: string
  name: string
  contactType: ContactType
  sex: Sex | null
  notes: string | null
  pipelineState: PipelineState
  sourceChannel: SourceChannel | null
  interestLevel: InterestLevel | null
  createdBy: string
  creator: ContactCreatorRef | null
  primaryChannel: ContactPrimaryChannel | null
  createdAt: Date
  updatedAt: Date
}

export interface ContactAssignmentListItem {
  userId: string
  userName: string
  role: ContactAssignmentRole
  assignedBy: string
  assignedAt: Date
}

export type ContactListInput = ListQuery

export interface ContactQueries {
  list(input: ContactListInput): Promise<Page<ContactListItem>>
  kpis(): Promise<ContactKpisResult>
  findCreatorRef(userId: string): Promise<ContactCreatorRef | null>
  listAssignments(contactId: string, params: PageParams): Promise<Page<ContactAssignmentListItem>>
}
