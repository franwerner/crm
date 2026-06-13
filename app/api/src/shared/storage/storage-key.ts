export function sanitizeObjectName(rawName: string): string {
  return rawName
    .replace(/[^\x20-\x7E]/g, '-')
    .replace(/\//g, '-')
    .slice(0, 200)
}

export function buildObjectKey(
  prefix: string,
  id: string,
  rawName: string,
): { key: string; sanitizedName: string } {
  const sanitizedName = sanitizeObjectName(rawName)
  return { key: `${prefix}/${id}-${sanitizedName}`, sanitizedName }
}
