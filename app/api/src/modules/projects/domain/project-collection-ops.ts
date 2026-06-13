import { NotFoundError } from '@shared/errors'

export function collectionAdd<T>(collection: readonly T[], item: T): readonly T[] {
  return [...collection, item]
}

export function collectionUpdateById<T extends { id: string }>(
  collection: readonly T[],
  id: string,
  notFoundMessage: string,
  applyChanges: (existing: T) => T,
): readonly T[] {
  const exists = collection.some((item) => item.id === id)
  if (!exists) throw new NotFoundError(notFoundMessage)
  return collection.map((item) => (item.id === id ? applyChanges(item) : item))
}

export function collectionRemoveById<T extends { id: string }>(
  collection: readonly T[],
  id: string,
  notFoundMessage: string,
): readonly T[] {
  const exists = collection.some((item) => item.id === id)
  if (!exists) throw new NotFoundError(notFoundMessage)
  return collection.filter((item) => item.id !== id)
}
