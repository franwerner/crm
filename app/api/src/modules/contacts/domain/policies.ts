import { PipelineState } from '@modules/contacts/domain/types/pipeline-state'
import { EventType } from '@modules/contacts/domain/types/event-type'

type TransitionMatrix = Partial<Record<PipelineState, Partial<Record<EventType, PipelineState>>>>

const TRANSITIONS: TransitionMatrix = {
  [PipelineState.Contact]: {
    [EventType.ResponseReceived]: PipelineState.Lead,
    [EventType.MeetingCall]: PipelineState.Lead,
    [EventType.ProposalSent]: PipelineState.Lead,
    [EventType.ProposalWon]: PipelineState.Customer,
    [EventType.Discarded]: PipelineState.Discarded,
  },
  [PipelineState.Lead]: {
    [EventType.ProposalWon]: PipelineState.Customer,
    [EventType.ProposalRejected]: PipelineState.AtRisk,
    [EventType.Discarded]: PipelineState.Discarded,
  },
  [PipelineState.AtRisk]: {
    [EventType.ResponseReceived]: PipelineState.Lead,
    [EventType.MeetingCall]: PipelineState.Lead,
    [EventType.ProposalSent]: PipelineState.Lead,
    [EventType.ProposalWon]: PipelineState.Customer,
    [EventType.Discarded]: PipelineState.Discarded,
  },
  [PipelineState.Discarded]: {
    [EventType.Reopened]: PipelineState.Contact,
  },
}

export function applyTransition(current: PipelineState, eventType: EventType): PipelineState | null {
  const next = TRANSITIONS[current]?.[eventType]
  if (!next || next === current) return null
  return next
}

const ALL_EVENT_TYPES: readonly EventType[] = Object.values(EventType)

export function allowedEventsFor(state: PipelineState): readonly EventType[] {
  if (state === PipelineState.Discarded) {
    return [EventType.Reopened]
  }
  return ALL_EVENT_TYPES
}

export function isEventAllowed(state: PipelineState, eventType: EventType): boolean {
  return allowedEventsFor(state).includes(eventType)
}
