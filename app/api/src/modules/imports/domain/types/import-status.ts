// Domain type mirroring the pgEnum import_status — no runtime dependency.
export type ImportStatus =
  | 'awaiting_mapping'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
