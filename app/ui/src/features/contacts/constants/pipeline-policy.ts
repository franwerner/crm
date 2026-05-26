import type { ContactViewPipelineStateEnumKey } from '@shared/api/types/ContactView'
import type { RegisterEventBodyEventTypeEnumKey } from '@shared/api/types/RegisterEventBody'

type PipelineState = ContactViewPipelineStateEnumKey
type EventType = RegisterEventBodyEventTypeEnumKey

const ALL_EVENTS: EventType[] = [
  'FirstContact',
  'MessageSent',
  'ResponseReceived',
  'MeetingCall',
  'ProposalSent',
  'ProposalWon',
  'ProposalRejected',
  'FollowUpPending',
  'Note',
  'Discarded',
  'Reopened',
]

export function allowedEventsForState(state: PipelineState): EventType[] {
  if (state === 'Discarded') return ['Reopened']
  return ALL_EVENTS
}

const TRANSITIONS: Partial<Record<PipelineState, Partial<Record<EventType, PipelineState>>>> = {
  Contact: {
    ResponseReceived: 'Lead',
    MeetingCall: 'Lead',
    ProposalSent: 'Lead',
    ProposalWon: 'Customer',
    Discarded: 'Discarded',
  },
  Lead: {
    ProposalWon: 'Customer',
    ProposalRejected: 'AtRisk',
    Discarded: 'Discarded',
  },
  AtRisk: {
    ResponseReceived: 'Lead',
    MeetingCall: 'Lead',
    ProposalSent: 'Lead',
    ProposalWon: 'Customer',
    Discarded: 'Discarded',
  },
  Discarded: {
    Reopened: 'Contact',
  },
}

export function applyTransition(current: PipelineState, eventType: EventType): PipelineState | null {
  const next = TRANSITIONS[current]?.[eventType]
  if (!next || next === current) return null
  return next
}
