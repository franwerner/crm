export type StateChangeCause =
  | { kind: 'manual'; userId: string; note?: string }
  | { kind: 'system'; reason: string }
