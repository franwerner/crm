import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { config } from './shared/config'
import { errorHandler } from './shared/http/error-handler'
import { ValidationError } from './shared/errors'

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
