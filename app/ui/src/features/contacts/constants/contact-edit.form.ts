import type { AnyFormFieldDescriptor } from '@shared/lib/form-view/types'
import type { UpdateContactBody } from '@shared/api/types/UpdateContactBody'
import {
  contactTypeOptions,
  sexOptions,
  sourceChannelOptions,
  interestLevelOptions,
} from '@features/contacts/constants/contacts.options'
import { interestLevelBadge, sourceChannelBadge } from '@features/contacts/constants/status-color-badge.constat'

export const contactEditFields: ReadonlyArray<AnyFormFieldDescriptor<UpdateContactBody>> = [
  { key: 'name', label: 'Nombre', widget: 'text', placeholder: 'Nombre completo' },
  {
    key: 'contactType',
    label: 'Tipo',
    widget: 'select',
    options: contactTypeOptions,
  },
  {
    key: 'sex',
    label: 'Sexo',
    widget: 'select',
    options: sexOptions,
    visible: (v) => v.contactType !== 'Company',
  },
  {
    key: 'sourceChannel',
    label: 'Canal de origen',
    widget: 'select',
    options: sourceChannelOptions,
    badgeVariants: sourceChannelBadge,
  },
  {
    key: 'interestLevel',
    label: 'Nivel de interés',
    widget: 'select',
    options: interestLevelOptions,
    badgeVariants: interestLevelBadge,
  },
  { key: 'notes', label: 'Notas', widget: 'textarea', placeholder: 'Notas…' },
  { key: 'addressStreet', label: 'Calle', widget: 'text', placeholder: 'Calle' },
  { key: 'addressNumber', label: 'Número', widget: 'text', placeholder: 'Número' },
  { key: 'addressPostalCode', label: 'Código postal', widget: 'text', placeholder: 'CP' },
  { key: 'addressCity', label: 'Ciudad', widget: 'text', placeholder: 'Ciudad' },
  { key: 'addressProvince', label: 'Provincia', widget: 'text', placeholder: 'Provincia' },
  { key: 'addressCountry', label: 'País', widget: 'text', placeholder: 'País' },
]
