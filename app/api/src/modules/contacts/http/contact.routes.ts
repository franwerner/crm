import { OpenAPIHono } from '@hono/zod-openapi'
import { authMiddleware } from '@shared/http/auth-middleware'
import { bracketedQueryMiddleware } from '@shared/http/bracketed-query'
import type { ContactController } from '@modules/contacts/http/contact.controller'
import { registerContactCoreRoutes } from './routes/contact-core.routes'
import { registerContactChannelRoutes } from './routes/contact-channel.routes'
import { registerContactEventRoutes } from './routes/contact-event.routes'
import { registerContactStateChangeRoutes } from './routes/contact-state-change.routes'
import { registerContactAssignmentRoutes } from './routes/contact-assignment.routes'

export function createContactsRouter(controller: ContactController): OpenAPIHono {
  const router = new OpenAPIHono()

  router.use('*', bracketedQueryMiddleware)
  router.use('*', authMiddleware)

  registerContactCoreRoutes(router, controller)
  registerContactChannelRoutes(router, controller)
  registerContactEventRoutes(router, controller)
  registerContactStateChangeRoutes(router, controller)
  registerContactAssignmentRoutes(router, controller)

  return router
}
