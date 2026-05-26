export type StateChangeCause =
  | { kind: 'manual'; userId: string }
  | { kind: 'system'; reason: string }
