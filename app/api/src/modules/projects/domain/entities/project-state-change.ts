import type { ProjectStatus } from '@modules/projects/domain/types/project-status'
import type { StateChangeCause } from '@modules/projects/domain/types/state-change-cause'

export interface ProjectStateChange {
  readonly id: string
  readonly projectId: string
  readonly previousState: ProjectStatus
  readonly nextState: ProjectStatus
  readonly cause: StateChangeCause
  readonly changedAt: Date
  readonly createdAt: Date
}
