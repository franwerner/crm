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
import { bootstrapImports } from '@modules/imports/infrastructure/bootstrap'
import { BunObjectStorage } from '@shared/storage'
import { createPinoLogger } from '@shared/logger'
import { BullMQAdapter } from '@shared/queue/queue.bullmq'
import { DnsPhoneChannelChecker } from '@shared/verification/dns-phone-channel-checker'
import { BunRedisMxCache } from '@shared/verification/mx-cache.bun-redis'
import { Contact } from '@modules/contacts/domain/contact'
import type { ImportContactRecord, ImportBulkContactPort } from '@modules/imports/application/ports'

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

  // MxCache backed by Bun.redis native client (D6, ADR redis.md).
  // Replaces the no-op placeholder from Phase 2/3; now MX lookups are cached with 1h TTL.
  const mxCache = new BunRedisMxCache(config.redisUrl)

  // ChannelChecker built once here and shared with all slices that need it (D8).
  const checker = new DnsPhoneChannelChecker(mxCache, config.importDefaultPhoneRegion)

  const users = bootstrapUsers(db)
  const auth = bootstrapAuth(db)
  const contacts = bootstrapContacts(db, checker)
  const projects = bootstrapProjects(db, storage, logger)

  // Bridge: maps ImportContactRecord → Contact so ContactBulkRepository satisfies ImportBulkContactPort.
  // Lives here (composition root) because cross-slice wiring is only allowed in app.ts (adr02-5).
  const importBulkPort: ImportBulkContactPort = {
    async createMany(records: ImportContactRecord[], tx?: unknown): Promise<void> {
      const mapped = records.map((r) =>
        Contact.create({
          id: r.id,
          name: r.name,
          createdBy: r.createdBy,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          channels: r.channels.map((ch) => ({
            id: ch.id,
            contactId: ch.contactId,
            channelType: ch.channelType,
            value: ch.value,
            isPrimary: ch.isPrimary,
            createdAt: ch.createdAt,
            updatedAt: ch.updatedAt,
            verificationStatus: ch.verificationStatus,
            verifiedAt: ch.verifiedAt,
            verificationDetail: ch.verificationDetail,
          })),
        }),
      )
      await contacts.bulkRepo.createMany(mapped, tx)
    },
  }

  const imports = bootstrapImports(db, storage, queue, logger, checker, importBulkPort)

  app.route('/', auth.router)
  app.route('/', users.router)
  app.route('/', contacts.router)
  app.route('/', projects.router)
  app.route('/', imports.router)

  // Return queue so server.ts can use it for the ping health check.
  return { app, logger, queue }
}

export type App = ReturnType<typeof createApp>['app']
