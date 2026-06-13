import { buildObjectKey } from '@shared/storage'

const DOCUMENTS_KEY_PREFIX = 'projects/documents'

export function buildDocumentStorageKey(
  projectId: string,
  documentId: string,
  rawFileName: string,
): { key: string; sanitizedFileName: string } {
  const { key, sanitizedName } = buildObjectKey(
    `${DOCUMENTS_KEY_PREFIX}/${projectId}`,
    documentId,
    rawFileName,
  )
  return { key, sanitizedFileName: sanitizedName }
}
