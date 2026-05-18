export const SourceChannel = {
  Instagram: 'Instagram',
  WhatsApp: 'WhatsApp',
  Referral: 'Referral',
  Email: 'Email',
  Other: 'Other',
} as const
export type SourceChannel = (typeof SourceChannel)[keyof typeof SourceChannel]
