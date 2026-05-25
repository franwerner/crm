import type { ContactViewPipelineStateEnumKey, ContactViewSourceChannelEnumKey, ContactViewInterestLevelEnumKey } from '@shared/api/types/ContactView'

type Option<T extends string> = { value: T; label: string }

export const pipelineStateOptions: Option<ContactViewPipelineStateEnumKey>[] = [
  { value: 'Contact', label: 'Contact' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Customer', label: 'Customer' },
  { value: 'Discarded', label: 'Discarded' },
]

export const sourceChannelOptions: Option<ContactViewSourceChannelEnumKey>[] = [
  { value: 'Instagram', label: 'Instagram' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Email', label: 'Email' },
  { value: 'Other', label: 'Otro' },
]

export const interestLevelOptions: Option<ContactViewInterestLevelEnumKey>[] = [
  { value: 'Cold', label: 'Frío' },
  { value: 'Warm', label: 'Tibio' },
  { value: 'Hot', label: 'Caliente' },
]
