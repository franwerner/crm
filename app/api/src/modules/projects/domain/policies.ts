import { BusinessRuleError } from '@shared/errors'
import type { ProjectStatus } from '@modules/projects/domain/types/project-status'

type TransitionMap = Partial<Record<ProjectStatus, readonly ProjectStatus[]>>

const ALLOWED_TRANSITIONS: TransitionMap = {
  Draft: ['Active'],
  Active: ['Closed', 'Cancelled'],
}

export function isAllowedTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

export function assertAllowedTransition(from: ProjectStatus, to: ProjectStatus): void {
  if (!isAllowedTransition(from, to)) {
    throw new BusinessRuleError(
      `Transition from '${from}' to '${to}' is not allowed`,
    )
  }
}
