import type { FilterSchema } from '@shared/lib/utils/filter'
import type { EntityDescriptor } from './types'

export function toFilterSchema<T>(descriptor: EntityDescriptor<T>): FilterSchema {
  return descriptor.fields
    .filter((f) => f.filterable)
    .map((f) => ({
      key: f.key as string,
      label: f.label,
      type: f.filterType ?? 'text',
      options: f.options ? [...f.options] : undefined,
      relation: f.relation,
    }))
}
