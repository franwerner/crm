import { PipelineState } from './types/pipeline-state'
import type { EventType } from './types/event-type'

export const STATE_ORDER: Record<PipelineState, number> = {
  [PipelineState.Contact]: 0,
  [PipelineState.Lead]: 1,
  [PipelineState.Customer]: 2,
  [PipelineState.Discarded]: 3,
}

export function resolveTargetState(eventType: EventType): PipelineState | null {
  switch (eventType) {
    case 'ResponseReceived':
    case 'MeetingCall':
    case 'ProposalSent':
      return PipelineState.Lead
    case 'ProposalWon':
      return PipelineState.Customer
    default:
      return null
  }
}

export function isForwardTransition(current: PipelineState, target: PipelineState): boolean {
  if (current === PipelineState.Discarded) return false
  if (target === PipelineState.Discarded) return false
  return STATE_ORDER[target] > STATE_ORDER[current]
}
