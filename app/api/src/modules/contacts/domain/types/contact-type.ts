export const ContactType = {
  Person: 'Person',
  Company: 'Company',
} as const
export type ContactType = (typeof ContactType)[keyof typeof ContactType]
