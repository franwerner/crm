export type StateChangeCause =
  | { kind: 'event'; eventId: string }
  | { kind: 'manual'; userId: string }
