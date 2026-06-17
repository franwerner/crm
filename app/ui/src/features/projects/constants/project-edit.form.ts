import { z } from 'zod/v4'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import type { ProjectView } from '@shared/api/types/ProjectView'
import { createProjectBodySchema } from '@shared/api/schemas/createProjectBodySchema'
import { contactRelation } from '@shared/lib/data-view/relations/contact.relation'

function toIsoDate(value: unknown): unknown {
  if (typeof value === 'string' && value.length > 10) return value.slice(0, 10)
  return value
}

export const projectEditFormSchema = createProjectBodySchema
  .omit({ plannedEndDate: true })
  .extend({
    startDate: z.preprocess(toIsoDate, z.iso.date()),
  })

export type ProjectEditFormValues = z.infer<typeof projectEditFormSchema>

export function getProjectEditDefaults(project: ProjectView): ProjectEditFormValues {
  return {
    name: project.name,
    description: project.description,
    contactId: project.contactId,
    currency: project.currency,
    startDate: project.startDate,
  }
}

export const projectEditForm: FormDescriptor<ProjectEditFormValues> = {
  name: 'project-edit',
  fields: [
    { key: 'name', label: 'Nombre', widget: 'text', required: true, placeholder: 'Nombre del proyecto' },
    { key: 'description', label: 'Descripción', widget: 'textarea', placeholder: 'Descripción del proyecto…' },
    { key: 'contactId', label: 'Contacto', widget: 'relation', required: true, relation: contactRelation, placeholder: 'Buscar contacto…' },
    {
      key: 'currency',
      label: 'Moneda (ISO 4217)',
      widget: 'text',
      required: true,
      placeholder: 'USD',
      extra: 'Cambiar la moneda no convierte los montos existentes (cambio de etiqueta: los números quedan iguales). Si necesitás conversión real, hay que recrear los amounts manualmente.',
    },
    { key: 'startDate', label: 'Fecha de inicio', widget: 'date', required: true },
  ],
}
