export const CONTACT_TABS = ['overview', 'analysis'] as const
export type ContactTab = (typeof CONTACT_TABS)[number]
