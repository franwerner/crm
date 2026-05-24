import qs from 'qs'
import { z } from '@hono/zod-openapi'

function flatToQs(flat: Record<string, string>): string {
  return Object.entries(flat)
    .map(
      ([k, v]) =>
        encodeURIComponent(k).replaceAll('%5B', '[').replaceAll('%5D', ']') +
        '=' +
        encodeURIComponent(v).replaceAll('%2C', ','),
    )
    .join('&')
}

export function qsQuery<T extends z.ZodTypeAny>(schema: T): T {
  return z.preprocess((raw) => {
    if (raw === null || raw === undefined || typeof raw !== 'object') {
      return raw
    }
    return qs.parse(flatToQs(raw as Record<string, string>), { comma: true })
  }, schema) as unknown as T
}
