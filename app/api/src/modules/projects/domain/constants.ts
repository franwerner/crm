export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

export const PRESIGNED_DOWNLOAD_TTL_SECONDS = 900

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
] as const

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]
