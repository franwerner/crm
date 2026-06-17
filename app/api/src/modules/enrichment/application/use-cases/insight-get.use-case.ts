import type { ContactInsightRepository } from '@modules/enrichment/domain/contact-insight.repository'
import type { ContactInsight } from '@modules/enrichment/domain/entities/contact-insight'
import { NotFoundError } from '@shared/errors'

export class InsightGetUseCase {
  constructor(private readonly insightRepo: ContactInsightRepository) {}

  async execute(insightId: string): Promise<ContactInsight> {
    const insight = await this.insightRepo.findById(insightId)
    if (!insight) throw new NotFoundError(`Insight '${insightId}' not found`)
    return insight
  }
}
