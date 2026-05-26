import type {
  ContactViewPipelineStateEnumKey,
  ContactViewInterestLevelEnumKey,
  ContactViewSourceChannelEnumKey,
} from '@shared/api/types/ContactView'
import type { StatesStateEnumKey } from '@shared/api/types/ContactKpisResponse'
import type { CreateContactBody } from '@shared/api/types/CreateContactBody'

export type ContactPipelineState = ContactViewPipelineStateEnumKey

export type ContactInterestLevel = ContactViewInterestLevelEnumKey

export type ContactSourceChannel = ContactViewSourceChannelEnumKey

export type CreateContactFormValues = CreateContactBody

export type ContactKpiItem = {
  state: StatesStateEnumKey
  value: number
  trend: { direction: 'up' | 'down' | 'neutral'; value: string }
}

export type ContactKpisTotal = {
  count: number
  trend: { direction: 'up' | 'down' | 'neutral'; value: string }
}
