import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import { createProjectBodySchema } from '@shared/api/schemas/createProjectBodySchema'
import { contactRelation } from '@shared/lib/data-view/relations/contact.relation'

function toIsoDate(value: unknown): unknown {
  if (typeof value === 'string' && value.length > 10) return value.slice(0, 10)
  return value
}

export const projectCreateFormSchema = createProjectBodySchema.extend({
  startDate: z.preprocess(toIsoDate, z.iso.date()),
  plannedEndDate: z.preprocess(toIsoDate, z.iso.date()),
})

export type ProjectCreateFormValues = z.infer<typeof projectCreateFormSchema>

export const projectCreateDefaultValues: ProjectCreateFormValues = {
  name: '',
  description: null,
  contactId: '',
  currency: '',
  startDate: '',
  plannedEndDate: '',
}

export const projectCreateForm: FormDescriptor<ProjectCreateFormValues> = {
  name: 'project-create',
  fields: [
    { key: 'name', label: 'Nombre', widget: 'text', required: true, placeholder: 'Nombre del proyecto' },
    { key: 'description', label: 'Descripción', widget: 'textarea', placeholder: 'Descripción del proyecto…' },
    { key: 'contactId', label: 'Contacto', widget: 'relation', required: true, relation: contactRelation, placeholder: 'Buscar contacto…' },
    { key: 'currency', label: 'Moneda (ISO 4217)', widget: 'text', required: true, placeholder: 'USD' },
    { key: 'startDate', label: 'Fecha de inicio', widget: 'date', required: true },
    { key: 'plannedEndDate', label: 'Fecha de fin planificada', widget: 'date', required: true },
  ],
}
