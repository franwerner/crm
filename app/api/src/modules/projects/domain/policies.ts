import { BusinessRuleError } from '@shared/errors'
import { ProjectStatus } from '@modules/projects/domain/types/project-status'

type TransitionMap = Partial<Record<ProjectStatus, readonly ProjectStatus[]>>

const ALLOWED_TRANSITIONS: TransitionMap = {
  Draft: ['Active'],
  Active: ['Closed', 'Cancelled'],
  Cancelled: ['Active'],
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

export function isNoteRequired(from: ProjectStatus, to: ProjectStatus): boolean {
  if (to === ProjectStatus.Cancelled) return true
  if (from === ProjectStatus.Cancelled && to === ProjectStatus.Active) return true
  return false
}

export function assertNoteRequirement(
  from: ProjectStatus,
  to: ProjectStatus,
  note: string | undefined,
): void {
  if (isNoteRequired(from, to) && !note?.trim()) {
    throw new BusinessRuleError(
      `A note is required when transitioning from '${from}' to '${to}'`,
    )
  }
}
