import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import type { ProjectExtensionView } from '@shared/api/types/ProjectExtensionView'
import { addExtensionBodySchema } from '@shared/api/schemas/addExtensionBodySchema'

function toIsoDate(value: unknown): unknown {
  if (typeof value === 'string' && value.length > 10) return value.slice(0, 10)
  return value
}

export const extensionEditFormSchema = addExtensionBodySchema.extend({
  grantedAt: z.preprocess(toIsoDate, z.iso.date()),
})

export type ExtensionEditFormValues = z.infer<typeof extensionEditFormSchema>

export const extensionEditForm: FormDescriptor<ExtensionEditFormValues> = {
  name: 'extension-edit',
  fields: [
    { key: 'additionalDays', label: 'Días adicionales', widget: 'number', required: true, placeholder: '1' },
    { key: 'reason', label: 'Motivo', widget: 'textarea', required: true, placeholder: 'Motivo de la extensión…' },
    { key: 'cost', label: 'Gasto adicional (centavos, opcional)', widget: 'number', placeholder: '0' },
    { key: 'billedAmount', label: 'Presupuesto adicional (centavos, opcional)', widget: 'number', placeholder: '0' },
    { key: 'grantedAt', label: 'Fecha de otorgamiento', widget: 'date', required: true },
  ],
}

export function getExtensionEditDefaults(item: ProjectExtensionView): ExtensionEditFormValues {
  return {
    additionalDays: item.additionalDays,
    reason: item.reason,
    cost: item.cost,
    billedAmount: item.billedAmount,
    grantedAt: item.grantedAt,
  }
}
