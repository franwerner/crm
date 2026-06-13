export const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
] as const

export const DOCUMENT_TYPES_HINT = 'PDF, imágenes, Word, Excel o texto · hasta 25 MB'
