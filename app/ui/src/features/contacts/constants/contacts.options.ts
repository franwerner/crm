import type { ContactViewPipelineStateEnumKey, ContactViewSourceChannelEnumKey, ContactViewInterestLevelEnumKey } from '@shared/api/types/ContactView'
import type { ContactListItemContactTypeEnumKey, ContactListItemSexEnumKey } from '@shared/api/types/ContactListItem'
import type { ChannelsChannelTypeEnum2Key } from '@shared/api/types/CreateContactBody'
import type { ContactEventViewEventTypeEnumKey } from '@shared/api/types/ContactEventView'
import { optionsToLabelMap } from '@shared/lib/data-view'
import type { Option } from '@shared/lib/types/option'

export const pipelineStateOptions: Option<ContactViewPipelineStateEnumKey>[] = [
  { value: 'Contact', label: 'Contacto' },
  { value: 'Lead', label: 'Interesado' },
  { value: 'AtRisk', label: 'En riesgo' },
  { value: 'Customer', label: 'Cliente' },
  { value: 'Discarded', label: 'Descartado' },
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

export const contactTypeOptions: Option<ContactListItemContactTypeEnumKey>[] = [
  { value: 'Person', label: 'Persona' },
  { value: 'Company', label: 'Empresa' },
]

export const sexOptions: Option<ContactListItemSexEnumKey>[] = [
  { value: 'Male', label: 'Masculino' },
  { value: 'Female', label: 'Femenino' },
  { value: 'Other', label: 'Otro' },
  { value: 'Unspecified', label: 'No especificado' },
]

export const channelTypeOptions: Option<ChannelsChannelTypeEnum2Key>[] = [
  { value: 'Phone', label: 'Teléfono' },
  { value: 'Email', label: 'Email' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Website', label: 'Sitio web' },
  { value: 'Other', label: 'Otro' },
]

export const pipelineStateLabels = optionsToLabelMap(pipelineStateOptions)
export const sourceChannelLabels = optionsToLabelMap(sourceChannelOptions)
export const interestLevelLabels = optionsToLabelMap(interestLevelOptions)
export const contactTypeLabels = optionsToLabelMap(contactTypeOptions)
export const sexLabels = optionsToLabelMap(sexOptions)
export const channelTypeLabels = optionsToLabelMap(channelTypeOptions)

export const eventTypeOptions: Option<ContactEventViewEventTypeEnumKey>[] = [
  { value: 'FirstContact', label: 'Primer contacto' },
  { value: 'MessageSent', label: 'Mensaje enviado' },
  { value: 'ResponseReceived', label: 'Respuesta recibida' },
  { value: 'MeetingCall', label: 'Reunión / llamada' },
  { value: 'ProposalSent', label: 'Propuesta enviada' },
  { value: 'ProposalWon', label: 'Propuesta ganada' },
  { value: 'ProposalRejected', label: 'Propuesta rechazada' },
  { value: 'FollowUpPending', label: 'Seguimiento pendiente' },
  { value: 'Note', label: 'Nota' },
  { value: 'Discarded', label: 'Descartar' },
  { value: 'Reopened', label: 'Reabrir' },
]

export const eventTypeLabels = optionsToLabelMap(eventTypeOptions)
