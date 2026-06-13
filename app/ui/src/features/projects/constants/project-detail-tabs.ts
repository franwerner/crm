export const PROJECT_TABS = ['summary', 'finance', 'people', 'documents', 'activity'] as const
export type ProjectTab = (typeof PROJECT_TABS)[number]
