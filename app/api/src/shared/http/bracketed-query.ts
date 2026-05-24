import type { Context, Next } from 'hono'
import qs from 'qs'

export async function bracketedQueryMiddleware(c: Context, next: Next): Promise<void> {
  const url = c.req.raw.url
  const qIdx = url.indexOf('?')
  const queryStr = qIdx >= 0 ? url.slice(qIdx + 1) : ''
  const parsed = qs.parse(queryStr, { comma: true }) as Record<string, unknown>

  const req = c.req as unknown as {
    query: (key?: string) => unknown
    queries: () => Record<string, unknown>
  }
  req.query = (key?: string) => (key !== undefined ? parsed[key] : parsed)
  req.queries = () => parsed

  await next()
}
