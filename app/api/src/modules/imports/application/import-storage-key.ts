import { buildObjectKey } from '@shared/storage'

const IMPORTS_KEY_PREFIX = 'imports/files'

export function buildImportStorageKey(
  importId: string,
  rawFilename: string,
): { key: string; sanitizedFilename: string } {
  const { key, sanitizedName } = buildObjectKey(
    `${IMPORTS_KEY_PREFIX}/${importId}`,
    importId,
    rawFilename,
  )
  return { key, sanitizedFilename: sanitizedName }
}

export function buildRejectedCsvKey(importId: string): string {
  return `${IMPORTS_KEY_PREFIX}/${importId}/rejected.csv`
}
