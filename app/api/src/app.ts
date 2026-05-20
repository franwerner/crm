import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { config } from './shared/config'
import { db } from './shared/db/client'
import { errorHandler } from './shared/http/error-handler'

import { ValidationError } from './shared/errors'
import { DrizzleUsersRepository } from './modules/users/infrastructure/user.repository.bun'
import { createUsersPublicApi } from './modules/users/public/user.public.impl'
import { createAuthRouter } from './modules/auth/http/auth.routes'
import { DrizzleContactsRepository } from './modules/contacts/infrastructure/contact.repository.bun'
import { createContactsRouter } from './modules/contacts/http/contact.routes'

export function createApp() {
  const app = new OpenAPIHono({
    defaultHook: (result) => {
      if (!result.success) {
        throw new ValidationError(
          'Request validation failed',
          result.error.issues.map((i) => ({
            field: i.path.join('.') || '(root)',
            message: i.message,
          })),
        )
      }
    },
  })

  app.onError(errorHandler)

  const healthRoute = createRoute({
    method: 'get',
    path: '/health',
    summary: 'Liveness probe',
    tags: ['system'],
    responses: {
      200: {
        description: 'API is up',
        content: {
          'application/json': { schema: z.object({ status: z.literal('ok') }) },
        },
      },
    },
  })
  app.openapi(healthRoute, (c) => c.json({ status: 'ok' as const }))

  const usersRepo = new DrizzleUsersRepository(db)
  const usersApi = createUsersPublicApi(usersRepo)
  const authRouter = createAuthRouter(usersApi)
  app.route('/', authRouter)

  const contactsRepo = new DrizzleContactsRepository(db)
  const contactsRouter = createContactsRouter(contactsRepo)
  app.route('/', contactsRouter)

  if (config.apiDocsEnabled) {
    app.doc('/openapi.json', {
      openapi: '3.0.0',
      info: { title: 'CRM API', version: '0.1.0' },
    })
    app.get('/docs', Scalar({ url: '/openapi.json' }))
  }

  return app
}

export type App = ReturnType<typeof createApp>
