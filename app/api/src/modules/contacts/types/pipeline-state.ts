export const PipelineState = {
  Contact: 'Contact',
  Lead: 'Lead',
  Customer: 'Customer',
  Discarded: 'Discarded',
} as const
export type PipelineState = (typeof PipelineState)[keyof typeof PipelineState]
