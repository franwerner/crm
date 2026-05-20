import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { config } from '../config'
import { UnauthorizedError } from '../errors'

declare module 'hono' {
  interface ContextVariableMap {
    userId: string
  }
}

export async function authMiddleware(c: Context, next: Next): Promise<void | Response> {
  const token = getCookie(c, config.sessionCookieName)

  if (!token) {
    throw new UnauthorizedError('Missing session cookie')
  }

  try {
    const payload = await verify(token, config.jwtSecret, 'HS256')

    const userId = payload['sub'] as string | undefined

    if (!userId) {
      throw new UnauthorizedError('Invalid token payload')
    }

    c.set('userId', userId)
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      throw err
    }
    throw new UnauthorizedError('Invalid or expired session')
  }

  await next()
}
