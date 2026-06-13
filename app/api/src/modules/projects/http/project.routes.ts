import { OpenAPIHono } from '@hono/zod-openapi'
import { authMiddleware } from '@shared/http/auth-middleware'
import { bracketedQueryMiddleware } from '@shared/http/bracketed-query'
import type { ProjectController } from '@modules/projects/http/project.controller'
import { registerCoreRoutes } from './routes/project-core.routes'
import { registerStateChangeRoutes } from './routes/project-state-change.routes'
import { registerResponsibleRoutes } from './routes/project-responsible.routes'
import { registerBudgetRoutes } from './routes/project-budget.routes'
import { registerExpenseRoutes } from './routes/project-expense.routes'
import { registerExtensionRoutes } from './routes/project-extension.routes'
import { registerDocumentRoutes } from './routes/project-document.routes'

export function createProjectsRouter(controller: ProjectController): OpenAPIHono {
  const router = new OpenAPIHono()

  router.use('*', bracketedQueryMiddleware)
  router.use('*', authMiddleware)

  registerCoreRoutes(router, controller)
  registerStateChangeRoutes(router, controller)
  registerResponsibleRoutes(router, controller)
  registerBudgetRoutes(router, controller)
  registerExpenseRoutes(router, controller)
  registerExtensionRoutes(router, controller)
  registerDocumentRoutes(router, controller)

  return router
}
