// API-side bootstrap for the enrichment module.
// Wires all adapters, use-cases, and the HTTP router.
import { OpenAPIHono } from '@hono/zod-openapi'
import type { Db } from '@shared/db/client'
import type { QueueProducer } from '@shared/queue'
import type { Logger } from '@shared/logger'
import type { ContactReadQuery } from '@modules/enrichment/application/ports'
import { DrizzleContactInsightRepository } from '@modules/enrichment/infrastructure/repositories/contact-insight.repo-part'
import { DrizzleAnalysisTemplateRepository } from '@modules/enrichment/infrastructure/repositories/analysis-template.repo-part'
import { OpenRouterLLMProvider } from '@modules/enrichment/infrastructure/openrouter-llm-provider'
import { EnrichmentEnqueueUseCase } from '@modules/enrichment/application/use-cases/enrichment-enqueue.use-case'
import { EnrichmentProcessUseCase } from '@modules/enrichment/application/use-cases/enrichment-process.use-case'
import { EnrichmentRetryUseCase } from '@modules/enrichment/application/use-cases/enrichment-retry.use-case'
import { EnrichmentReconcileUseCase } from '@modules/enrichment/application/use-cases/enrichment-reconcile.use-case'
import { TemplateCreateUseCase } from '@modules/enrichment/application/use-cases/template-create.use-case'
import { TemplateListUseCase } from '@modules/enrichment/application/use-cases/template-list.use-case'
import { TemplateUpdateUseCase } from '@modules/enrichment/application/use-cases/template-update.use-case'
import { TemplateDeactivateUseCase } from '@modules/enrichment/application/use-cases/template-deactivate.use-case'
import { InsightGetUseCase } from '@modules/enrichment/application/use-cases/insight-get.use-case'
import { EnrichmentController } from '@modules/enrichment/http/enrichment.controller'
import { TemplateController } from '@modules/enrichment/http/template.controller'
import { createEnrichmentRouter } from '@modules/enrichment/http/enrichment.routes'
import { createTemplateRouter } from '@modules/enrichment/http/template.routes'
import { config } from '@shared/config'

export interface EnrichmentModule {
  router: OpenAPIHono
  enqueueUseCase: EnrichmentEnqueueUseCase
  processUseCase: EnrichmentProcessUseCase
  reconcileUseCase: EnrichmentReconcileUseCase
}

/**
 * Bootstrap the enrichment module.
 *
 * @param db              Drizzle database instance (shared).
 * @param queue           Queue producer (shared).
 * @param logger          Structured logger (shared).
 * @param contactReadQuery Cross-slice read port — provided by the composition root (app.ts).
 *                         Lives here as a parameter so cross-slice wiring stays in app.ts.
 */
export function bootstrapEnrichment(
  db: Db,
  queue: QueueProducer,
  logger: Logger,
  contactReadQuery: ContactReadQuery,
): EnrichmentModule {
  void logger

  const insightRepo = new DrizzleContactInsightRepository(db)
  const templateRepo = new DrizzleAnalysisTemplateRepository(db)

  const llmProvider = new OpenRouterLLMProvider(config.openrouterApiKey, config.openrouterBaseUrl)

  const enqueueUseCase = new EnrichmentEnqueueUseCase(insightRepo, templateRepo, queue)
  const processUseCase = new EnrichmentProcessUseCase(
    insightRepo,
    templateRepo,
    contactReadQuery,
    llmProvider,
  )
  const retryUseCase = new EnrichmentRetryUseCase(insightRepo, queue)
  const reconcileUseCase = new EnrichmentReconcileUseCase(insightRepo, queue)

  const templateCreateUseCase = new TemplateCreateUseCase(templateRepo)
  const templateListUseCase = new TemplateListUseCase(templateRepo)
  const templateUpdateUseCase = new TemplateUpdateUseCase(templateRepo)
  const templateDeactivateUseCase = new TemplateDeactivateUseCase(templateRepo)
  const insightGetUseCase = new InsightGetUseCase(insightRepo)

  const enrichmentController = new EnrichmentController({
    enqueue: enqueueUseCase,
    retry: retryUseCase,
    get: insightGetUseCase,
  })
  const templateController = new TemplateController({
    create: templateCreateUseCase,
    list: templateListUseCase,
    update: templateUpdateUseCase,
    deactivate: templateDeactivateUseCase,
  })

  const enrichmentRouter = createEnrichmentRouter(enrichmentController)
  const templateRouter = createTemplateRouter(templateController)

  const router = new OpenAPIHono()
  router.route('/', enrichmentRouter)
  router.route('/', templateRouter)

  return {
    router,
    enqueueUseCase,
    processUseCase,
    reconcileUseCase,
  }
}
