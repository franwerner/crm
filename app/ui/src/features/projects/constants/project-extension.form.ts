import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import { addExtensionBodySchema } from '@shared/api/schemas/addExtensionBodySchema'

function toIsoDate(value: unknown): unknown {
  if (typeof value === 'string' && value.length > 10) return value.slice(0, 10)
  return value
}

export const extensionCreateFormSchema = addExtensionBodySchema.extend({
  grantedAt: z.preprocess(toIsoDate, z.iso.date()),
})

export type ExtensionCreateFormValues = z.infer<typeof extensionCreateFormSchema>

export const extensionCreateDefaultValues: ExtensionCreateFormValues = {
  additionalDays: 1,
  reason: '',
  cost: null,
  billedAmount: null,
  grantedAt: '',
}

export const extensionCreateForm: FormDescriptor<ExtensionCreateFormValues> = {
  name: 'extension-create',
  fields: [
    { key: 'additionalDays', label: 'Días adicionales', widget: 'number', required: true, placeholder: '1' },
    { key: 'reason', label: 'Motivo', widget: 'textarea', required: true, placeholder: 'Motivo de la extensión…' },
    { key: 'cost', label: 'Gasto adicional (centavos, opcional)', widget: 'number', placeholder: '0' },
    { key: 'billedAmount', label: 'Presupuesto adicional (centavos, opcional)', widget: 'number', placeholder: '0' },
    { key: 'grantedAt', label: 'Fecha de otorgamiento', widget: 'date', required: true },
  ],
}
