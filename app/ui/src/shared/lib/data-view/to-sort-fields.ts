import type { EntityDescriptor } from './types'

export function toSortFields<T>(descriptor: EntityDescriptor<T>): string[] {
  return descriptor.fields
    .filter((f) => f.sortable)
    .map((f) => f.key as string)
}
