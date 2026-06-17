import type { ContactInsightRepository } from '@modules/enrichment/domain/contact-insight.repository'
import type { AnalysisTemplateRepository } from '@modules/enrichment/domain/analysis-template.repository'
import type { ContactReadQuery, ContactFilterInput } from '@modules/enrichment/application/ports'
import type { QueueProducer } from '@shared/queue'
import { ContactInsight } from '@modules/enrichment/domain/entities/contact-insight'
import { NotFoundError, BusinessRuleError } from '@shared/errors'
import { newId } from '@shared/utils/id'
import type { TriggerKind } from '@modules/enrichment/domain/types/trigger-kind'
import { config } from '@shared/config'

export interface EnqueueIndividualInput {
  kind: 'individual'
  contactId: string
  templateId: string
}

export interface EnqueueBatchInput {
  kind: 'batch'
  contactIds: string[]
  templateId: string
  triggerKind?: TriggerKind
}

export interface EnqueueFilterInput {
  kind: 'filter'
  filter: ContactFilterInput
  templateId: string
}

export type EnqueueInput = EnqueueIndividualInput | EnqueueBatchInput | EnqueueFilterInput

export interface EnqueueBatchResult {
  insightIds: string[]
  count: number
  /** Contacts skipped because they already have an insight for this template. */
  skipped?: number
  /** True when resolved IDs exceeded ENRICHMENT_BATCH_MAX. */
  exceededMax?: boolean
}

export class EnrichmentEnqueueUseCase {
  constructor(
    private readonly insightRepo: ContactInsightRepository,
    private readonly templateRepo: AnalysisTemplateRepository,
    private readonly queue: QueueProducer,
    // Optional: only needed for filter-based batch (Fase 3, ADR cross-slice-id-resolution).
    private readonly contactReadQuery?: ContactReadQuery,
  ) {}

  async execute(input: EnqueueInput): Promise<EnqueueBatchResult> {
    const template = await this.templateRepo.findById(input.templateId)
    if (!template) {
      throw new NotFoundError(`Analysis template '${input.templateId}' not found`)
    }
    if (!template.isActive) {
      throw new BusinessRuleError(`Analysis template '${input.templateId}' is not active`)
    }

    if (input.kind === 'individual') {
      return this.enqueueOne(input.contactId, template.id, template.version, 'individual')
    }

    if (input.kind === 'filter') {
      if (!this.contactReadQuery) {
        throw new BusinessRuleError('Filter-based batch requires a contact read query — check composition root')
      }
      const allIds = await this.contactReadQuery.resolveByFilter(input.filter)
      const exceededMax = allIds.length > config.enrichmentBatchMax
      const result = await this.enqueueBatch(allIds, template.id, template.version, 'batch')
      return { ...result, exceededMax }
    }

    return this.enqueueBatch(
      input.contactIds,
      template.id,
      template.version,
      input.triggerKind ?? 'batch',
    )
  }

  // Called from composition root for T1 post-import trigger
  async executeBatch(
    contactIds: string[],
    triggerKind: TriggerKind,
    templateId: string,
  ): Promise<EnqueueBatchResult> {
    const template = await this.templateRepo.findById(templateId)
    if (!template) {
      throw new NotFoundError(`Analysis template '${templateId}' not found`)
    }
    if (!template.isActive) {
      throw new BusinessRuleError(`Analysis template '${templateId}' is not active`)
    }
    return this.enqueueBatch(contactIds, template.id, template.version, triggerKind)
  }

  private async enqueueOne(
    contactId: string,
    templateId: string,
    templateVersion: number,
    triggerKind: TriggerKind,
  ): Promise<EnqueueBatchResult> {
    const now = new Date()
    const insight = ContactInsight.create({
      id: newId(),
      contactId,
      templateId,
      templateVersion,
      triggerKind,
      createdAt: now,
      updatedAt: now,
    })
    await this.insightRepo.save(insight)
    await this.queue.enqueue(
      'enrich-llm',
      'enrich-llm',
      { insightId: insight.id },
      {
        attempts: config.llmMaxAttempts,
        backoff: { type: 'exponential', delay: 10000 },
      },
    )
    return { insightIds: [insight.id], count: 1 }
  }

  private async enqueueBatch(
    contactIds: string[],
    templateId: string,
    templateVersion: number,
    triggerKind: TriggerKind,
  ): Promise<EnqueueBatchResult> {
    // Respect the batch max throttle
    const capped = contactIds.slice(0, config.enrichmentBatchMax)
    const insightIds: string[] = []
    let skipped = 0
    const now = new Date()

    for (const contactId of capped) {
      // Skip contacts that already have an insight for this template
      const existing = await this.insightRepo.findByContactAndTemplate(contactId, templateId)
      if (existing) {
        skipped++
        continue
      }

      const insight = ContactInsight.create({
        id: newId(),
        contactId,
        templateId,
        templateVersion,
        triggerKind,
        createdAt: now,
        updatedAt: now,
      })
      await this.insightRepo.save(insight)
      await this.queue.enqueue(
        'enrich-llm',
        'enrich-llm',
        { insightId: insight.id },
        {
          attempts: config.llmMaxAttempts,
          backoff: { type: 'exponential', delay: 10000 },
        },
      )
      insightIds.push(insight.id)
    }

    return { insightIds, count: insightIds.length, skipped }
  }
}
