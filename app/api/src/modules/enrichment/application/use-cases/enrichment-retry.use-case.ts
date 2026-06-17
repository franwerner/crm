import type { ContactInsightRepository } from '@modules/enrichment/domain/contact-insight.repository'
import type { QueueProducer } from '@shared/queue'
import { NotFoundError } from '@shared/errors'
import { config } from '@shared/config'

export interface RetryInput {
  insightId: string
}

export class EnrichmentRetryUseCase {
  constructor(
    private readonly insightRepo: ContactInsightRepository,
    private readonly queue: QueueProducer,
  ) {}

  async execute(input: RetryInput): Promise<void> {
    const insight = await this.insightRepo.findById(input.insightId)
    if (!insight) throw new NotFoundError(`Insight '${input.insightId}' not found`)

    // resetForRetry() throws BusinessRuleError if not in 'failed' status
    const reset = insight.resetForRetry(new Date())
    await this.insightRepo.save(reset)

    await this.queue.enqueue(
      'enrich-llm',
      'enrich-llm',
      { insightId: reset.id },
      {
        attempts: config.llmMaxAttempts,
        backoff: { type: 'exponential', delay: 10000 },
      },
    )
  }
}
