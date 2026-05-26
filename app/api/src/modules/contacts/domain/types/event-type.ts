export const EventType = {
  FirstContact: 'FirstContact',
  MessageSent: 'MessageSent',
  ResponseReceived: 'ResponseReceived',
  MeetingCall: 'MeetingCall',
  ProposalSent: 'ProposalSent',
  ProposalWon: 'ProposalWon',
  ProposalRejected: 'ProposalRejected',
  FollowUpPending: 'FollowUpPending',
  Note: 'Note',
  Discarded: 'Discarded',
  Reopened: 'Reopened',
} as const
export type EventType = (typeof EventType)[keyof typeof EventType]
