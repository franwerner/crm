import type { Context } from 'hono'
import type { EnrichmentEnqueueUseCase } from '@modules/enrichment/application/use-cases/enrichment-enqueue.use-case'
import type { EnrichmentRetryUseCase } from '@modules/enrichment/application/use-cases/enrichment-retry.use-case'
import type { InsightGetUseCase } from '@modules/enrichment/application/use-cases/insight-get.use-case'
import type { InsightListByContactUseCase } from '@modules/enrichment/application/use-cases/insight-list-by-contact.use-case'
import type { EnrichRequestIn } from '@modules/enrichment/http/dto/enrichment.dto'
import type { ContactInsight } from '@modules/enrichment/domain/entities/contact-insight'

export interface EnrichmentUseCases {
  enqueue: EnrichmentEnqueueUseCase
  retry: EnrichmentRetryUseCase
  get: InsightGetUseCase
  listByContact: InsightListByContactUseCase
}

function insightToResponse(insight: ContactInsight) {
  return {
    id: insight.id,
    contactId: insight.contactId,
    templateId: insight.templateId,
    templateVersion: insight.templateVersion,
    triggerKind: insight.triggerKind,
    status: insight.status,
    attempts: insight.attempts,
    result: insight.result,
    modelUsed: insight.modelUsed,
    promptTokens: insight.promptTokens,
    completionTokens: insight.completionTokens,
    costUsd: insight.costUsd,
    lastError: insight.lastError,
    completedAt: insight.completedAt?.toISOString() ?? null,
    createdAt: insight.createdAt.toISOString(),
    updatedAt: insight.updatedAt.toISOString(),
  }
}

export class EnrichmentController {
  constructor(private readonly ucs: EnrichmentUseCases) {}

  async enqueueIndividual(c: Context): Promise<Response> {
    const body = c.req.valid('json' as never) as EnrichRequestIn
    const result = await this.ucs.enqueue.execute({
      kind: 'individual',
      contactId: body.contactId,
      templateId: body.templateId,
    })
    return c.json({ insightIds: result.insightIds, count: result.count }, 201)
  }

  async enqueueBatch(c: Context): Promise<Response> {
    // Body is validated as the discriminated union — kind defaults to 'ids' for the legacy shape.
    const body = c.req.valid('json' as never) as { kind?: string; contactIds?: string[]; filterGroups?: unknown; search?: string; templateId: string }

    if (body.kind === 'filter') {
      const result = await this.ucs.enqueue.execute({
        kind: 'filter',
        filter: {
          filterGroups: (body.filterGroups ?? []) as import('@shared/types/filters').FilterGroup[],
          search: body.search,
        },
        templateId: body.templateId,
      })
      return c.json({
        insightIds: result.insightIds,
        count: result.count,
        skipped: result.skipped,
        exceededMax: result.exceededMax,
      }, 201)
    }

    // Default: ids-based batch (backward compatible)
    const result = await this.ucs.enqueue.execute({
      kind: 'batch',
      contactIds: (body as { contactIds: string[] }).contactIds,
      templateId: body.templateId,
    })
    return c.json({ insightIds: result.insightIds, count: result.count, skipped: result.skipped }, 201)
  }

  async retry(c: Context): Promise<Response> {
    const insightId = c.req.param('id') as string
    await this.ucs.retry.execute({ insightId })
    return c.json({ insightId }, 200)
  }

  async getInsight(c: Context): Promise<Response> {
    const insightId = c.req.param('id') as string
    const insight = await this.ucs.get.execute(insightId)
    return c.json(insightToResponse(insight), 200)
  }

  async listByContact(c: Context): Promise<Response> {
    const contactId = c.req.query('contactId') as string
    const insights = await this.ucs.listByContact.execute(contactId)
    return c.json(insights.map(insightToResponse), 200)
  }
}
