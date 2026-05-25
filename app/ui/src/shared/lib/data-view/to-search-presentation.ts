import type { EntityDescriptor } from './types'

type SearchPresentation = {
  placeholder: string
  visible: boolean
}

export function toSearchPresentation<T>(descriptor: EntityDescriptor<T>): SearchPresentation {
  const searchableFields = descriptor.fields.filter((f) => f.searchable)

  if (searchableFields.length === 0) {
    return { placeholder: 'Buscar…', visible: false }
  }

  const labels = searchableFields.map((f) => f.label.toLowerCase())
  const placeholder = `Buscar por ${labels.join(' o ')}…`

  return { placeholder, visible: true }
}
