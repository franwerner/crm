export const ProjectResponsibleRole = {
  Lead: 'Lead',
  Member: 'Member',
} as const

export type ProjectResponsibleRole = (typeof ProjectResponsibleRole)[keyof typeof ProjectResponsibleRole]
