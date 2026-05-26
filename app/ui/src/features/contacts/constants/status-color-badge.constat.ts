import type { ContactViewInterestLevelEnumKey, ContactViewPipelineStateEnumKey, ContactViewSourceChannelEnumKey } from "@shared/api"
import type { BadgeProps } from "@shared/ui/badge"

export const pipelineStateBadge: Record<ContactViewPipelineStateEnumKey, BadgeProps['variant']> = {
  Contact: 'neutral',
  Lead: 'info',
  AtRisk: 'warning',
  Customer: 'success',
  Discarded: 'danger',
}

export const sourceChannelBadge: Record<ContactViewSourceChannelEnumKey, BadgeProps['variant']> = {
  Instagram: 'primary',
  WhatsApp: 'success',
  Referral: 'warning',
  Email: 'info',
  Other: 'neutral',
}

export const interestLevelBadge: Record<ContactViewInterestLevelEnumKey, BadgeProps['variant']> = {
  Cold: 'neutral',
  Warm: 'warning',
  Hot: 'danger',
}