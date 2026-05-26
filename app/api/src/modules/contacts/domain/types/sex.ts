export const Sex = {
  Male: 'Male',
  Female: 'Female',
  Other: 'Other',
  Unspecified: 'Unspecified',
} as const
export type Sex = (typeof Sex)[keyof typeof Sex]
