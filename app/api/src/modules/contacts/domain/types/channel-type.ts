export const ChannelType = {
  Phone: 'Phone',
  Email: 'Email',
  WhatsApp: 'WhatsApp',
  Instagram: 'Instagram',
  Website: 'Website',
  Other: 'Other',
} as const
export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType]
