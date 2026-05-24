import { setCookie, deleteCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import type { Context } from 'hono'
import { config } from '@shared/config'
import type { LoginUseCase } from '@modules/auth/application/use-cases/login.use-case'
import type { MeUseCase } from '@modules/auth/application/use-cases/me.use-case'

export interface AuthUseCases {
  login: LoginUseCase
  me: MeUseCase
}

export class AuthController {
  constructor(private readonly ucs: AuthUseCases) {}

  async login(c: Context): Promise<Response> {
    const body = c.req.valid('json' as never) as { email: string; password: string }

    const identity = await this.ucs.login.execute({
      email: body.email,
      password: body.password,
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

  logout(c: Context): Response {
    deleteCookie(c, config.sessionCookieName, { path: '/' })
    return c.body(null, 204)
  }

  async me(c: Context): Promise<Response> {
    const userId = c.get('userId')

    const profile = await this.ucs.me.execute({ userId })

    return c.json(
      {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
      200,
    )
  }
}
