export const InterestLevel = {
  Cold: 'Cold',
  Warm: 'Warm',
  Hot: 'Hot',
} as const
export type InterestLevel = (typeof InterestLevel)[keyof typeof InterestLevel]
