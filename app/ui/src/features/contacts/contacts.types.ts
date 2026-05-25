import type {
  ContactViewPipelineStateEnumKey,
  ContactViewInterestLevelEnumKey,
  ContactViewSourceChannelEnumKey,
} from '@shared/api/types/ContactView'
import type { CreateContactBody } from '@shared/api/types/CreateContactBody'

export type ContactPipelineState = ContactViewPipelineStateEnumKey

export type ContactInterestLevel = ContactViewInterestLevelEnumKey

export type ContactSourceChannel = ContactViewSourceChannelEnumKey

export type CreateContactFormValues = CreateContactBody
