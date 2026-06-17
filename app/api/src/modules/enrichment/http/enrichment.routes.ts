import { createRoute, z } from '@hono/zod-openapi'
import { OpenAPIHono } from '@hono/zod-openapi'
import { authMiddleware } from '@shared/http/auth-middleware'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import {
  EnrichRequestInSchema,
  BatchEnrichRequestInSchema,
  InsightOutSchema,
  BatchEnrichResponseSchema,
} from '@modules/enrichment/http/dto/enrichment.dto'
import type { EnrichmentController } from '@modules/enrichment/http/enrichment.controller'

// POST /enrichments — individual enqueue (T3)
const enqueueIndividualRoute = createRoute({
  method: 'post',
  path: '/enrichments',
  summary: 'Request LLM enrichment for a single contact',
  tags: ['enrichments'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: EnrichRequestInSchema } },
    },
  },
  responses: {
    201: {
      description: 'Enrichment insight created and queued.',
      content: { 'application/json': { schema: BatchEnrichResponseSchema } },
    },
    400: { description: 'Validation error.', content: { 'application/problem+json': { schema: ProblemSchema } } },
    401: { description: 'Unauthorized.', content: { 'application/problem+json': { schema: ProblemSchema } } },
    404: { description: 'Template not found.', content: { 'application/problem+json': { schema: ProblemSchema } } },
    422: { description: 'Template inactive.', content: { 'application/problem+json': { schema: ProblemSchema } } },
  },
})

// POST /enrichments/batch — batch enqueue (T2)
const enqueueBatchRoute = createRoute({
  method: 'post',
  path: '/enrichments/batch',
  summary: 'Request LLM enrichment for multiple contacts',
  tags: ['enrichments'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: BatchEnrichRequestInSchema } },
    },
  },
  responses: {
    201: {
      description: 'Batch enrichment queued. Returns created insight IDs (duplicates skipped).',
      content: { 'application/json': { schema: BatchEnrichResponseSchema } },
    },
    400: { description: 'Validation error.', content: { 'application/problem+json': { schema: ProblemSchema } } },
    401: { description: 'Unauthorized.', content: { 'application/problem+json': { schema: ProblemSchema } } },
    422: { description: 'Template inactive.', content: { 'application/problem+json': { schema: ProblemSchema } } },
  },
})

// POST /enrichments/:id/retry — retry failed insight (T4)
const retryRoute = createRoute({
  method: 'post',
  path: '/enrichments/{id}/retry',
  summary: 'Retry a failed enrichment insight',
  tags: ['enrichments'],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Insight reset to queued and re-enqueued.',
      content: { 'application/json': { schema: z.object({ insightId: z.string().uuid() }) } },
    },
    401: { description: 'Unauthorized.', content: { 'application/problem+json': { schema: ProblemSchema } } },
    404: { description: 'Insight not found.', content: { 'application/problem+json': { schema: ProblemSchema } } },
    422: { description: 'Insight is not in failed status.', content: { 'application/problem+json': { schema: ProblemSchema } } },
  },
})

// GET /enrichments/:id — polling (state + tracking)
const getInsightRoute = createRoute({
  method: 'get',
  path: '/enrichments/{id}',
  summary: 'Get enrichment insight status and result',
  tags: ['enrichments'],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Insight status, result (if completed), and tracking fields.',
      content: { 'application/json': { schema: InsightOutSchema } },
    },
    401: { description: 'Unauthorized.', content: { 'application/problem+json': { schema: ProblemSchema } } },
    404: { description: 'Insight not found.', content: { 'application/problem+json': { schema: ProblemSchema } } },
  },
})

export function createEnrichmentRouter(controller: EnrichmentController): OpenAPIHono {
  const router = new OpenAPIHono()

  router.use('*', authMiddleware)

  router.openapi(enqueueIndividualRoute, (c) => controller.enqueueIndividual(c) as never)
  router.openapi(enqueueBatchRoute, (c) => controller.enqueueBatch(c) as never)
  router.openapi(retryRoute, (c) => controller.retry(c) as never)
  router.openapi(getInsightRoute, (c) => controller.getInsight(c) as never)

  return router
}
