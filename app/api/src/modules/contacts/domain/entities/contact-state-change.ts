import type { PipelineState } from '@modules/contacts/domain/types/pipeline-state'
import type { StateChangeCause } from '@modules/contacts/domain/types/state-change-cause'

export interface ContactStateChange {
  readonly id: string
  readonly contactId: string
  readonly previousState: PipelineState
  readonly nextState: PipelineState
  readonly cause: StateChangeCause
  readonly changedAt: Date
  readonly createdAt: Date
}
