import type { FilterSchema } from '@shared/lib/filter'

export const contactsFilterSchema: FilterSchema = [
  {
    key: 'name',
    label: 'Nombre',
    type: 'text',
  },
  {
    key: 'phone',
    label: 'Teléfono',
    type: 'text',
  },
  {
    key: 'pipelineState',
    label: 'Estado',
    type: 'enum',
    options: [
      { value: 'Contact', label: 'Contact' },
      { value: 'Lead', label: 'Lead' },
      { value: 'Customer', label: 'Customer' },
      { value: 'Discarded', label: 'Discarded' },
    ],
  },
  {
    key: 'sourceChannel',
    label: 'Canal',
    type: 'enum',
    options: [
      { value: 'Instagram', label: 'Instagram' },
      { value: 'WhatsApp', label: 'WhatsApp' },
      { value: 'Referral', label: 'Referral' },
      { value: 'Email', label: 'Email' },
      { value: 'Other', label: 'Otro' },
    ],
  },
  {
    key: 'interestLevel',
    label: 'Interés',
    type: 'enum',
    options: [
      { value: 'Cold', label: 'Frío' },
      { value: 'Warm', label: 'Tibio' },
      { value: 'Hot', label: 'Caliente' },
    ],
  },
  {
    key: 'stateLocked',
    label: 'Bloqueado',
    type: 'boolean',
  },
  {
    key: 'createdAt',
    label: 'Creado',
    type: 'date',
  },
  {
    key: 'updatedAt',
    label: 'Actualizado',
    type: 'date',
  },
]
