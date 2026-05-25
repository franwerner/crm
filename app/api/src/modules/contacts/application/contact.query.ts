import type { PipelineState } from '@modules/contacts/domain/types/pipeline-state'
import type { SourceChannel } from '@modules/contacts/domain/types/source-channel'
import type { InterestLevel } from '@modules/contacts/domain/types/interest-level'
import type { ListQuery } from '@shared/types/filters'
import type { Page } from '@shared/types/pagination'

export interface ContactCreatorRef {
  id: string
  name: string
}

export interface ContactListItem {
  id: string
  name: string
  phone: string | null
  pipelineState: PipelineState
  stateLocked: boolean
  sourceChannel: SourceChannel | null
  interestLevel: InterestLevel | null
  createdBy: string
  creator: ContactCreatorRef | null
  createdAt: Date
  updatedAt: Date
}

export interface ContactListInput extends ListQuery {
  populated: boolean
}

export interface ContactQueries {
  list(input: ContactListInput): Promise<Page<ContactListItem>>
}
