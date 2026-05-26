export const ProjectStatus = {
  Draft: 'Draft',
  Active: 'Active',
  Closed: 'Closed',
  Cancelled: 'Cancelled',
} as const

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus]
