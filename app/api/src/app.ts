import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { config } from '@shared/config'
import { db } from '@shared/db/client'
import { errorHandler } from '@shared/http/error-handler'
import { requestLogger } from '@shared/http/request-logger'

import { ValidationError } from '@shared/errors'
import { bootstrapUsers } from '@modules/users/infrastructure/bootstrap'
import { bootstrapAuth } from '@modules/auth/infrastructure/bootstrap'
import { bootstrapContacts } from '@modules/contacts/infrastructure/bootstrap'
import { bootstrapProjects } from '@modules/projects/infrastructure/bootstrap'
import { BunObjectStorage } from '@shared/storage'
import { createPinoLogger } from '@shared/logger'
import { BullMQAdapter } from '@shared/queue/queue.bullmq'

export function createApp() {
  // Composition root: build infrastructure singletons here and inject downward.
  const logger = createPinoLogger({
    level: config.logLevel,
    isDevelopment: !config.isProduction,
  })

  // QueueProducer available for use-cases that need to enqueue jobs (Phases 1/2).
  // Constructed here so the connection is shared within the API process.
  const queue = new BullMQAdapter(config.redisUrl)

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

  // Mount request logger first so every subsequent handler has c.var.logger.
  app.use('*', requestLogger(logger))

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

  const storage = new BunObjectStorage({
    endpoint: config.minioEndpoint,
    accessKeyId: config.minioAccessKey,
    secretAccessKey: config.minioSecretKey,
    bucket: config.minioBucket,
    region: config.minioRegion,
  })

  const users = bootstrapUsers(db)
  const auth = bootstrapAuth(db)
  const contacts = bootstrapContacts(db)
  const projects = bootstrapProjects(db, storage, logger)

  app.route('/', auth.router)
  app.route('/', users.router)
  app.route('/', contacts.router)
  app.route('/', projects.router)

  // Return queue so server.ts can use it for the ping health check.
  return { app, logger, queue }
}

export type App = ReturnType<typeof createApp>['app']
