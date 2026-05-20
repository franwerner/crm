import { setCookie, deleteCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import type { Context } from 'hono'
import { config } from '@shared/config'
import type { UsersPublicApi } from '@modules/users/public/user.public'
import { login } from '@modules/auth/application/use-cases/login.use-case'

export async function loginHandler(c: Context, usersApi: UsersPublicApi): Promise<Response> {
  const body = c.req.valid('json' as never) as { email: string; password: string }

  const identity = await login({
    email: body.email,
    password: body.password,
    usersApi,
  })

  const now = Math.floor(Date.now() / 1000)
  const token = await sign(
    {
      sub: identity.userId,
      iat: now,
      exp: now + config.sessionMaxAgeSeconds,
    },
    config.jwtSecret,
    'HS256',
  )

  setCookie(c, config.sessionCookieName, token, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    secure: config.isProduction,
    maxAge: config.sessionMaxAgeSeconds,
  })

  return c.json({ userId: identity.userId }, 200)
}

export function logoutHandler(c: Context): Response {
  deleteCookie(c, config.sessionCookieName, { path: '/' })
  return c.body(null, 204)
}
