import type { ContactInsightRepository } from '@modules/enrichment/domain/contact-insight.repository'
import type { ContactInsight } from '@modules/enrichment/domain/entities/contact-insight'

export class InsightListByContactUseCase {
  constructor(private readonly insightRepo: ContactInsightRepository) {}

  async execute(contactId: string): Promise<ContactInsight[]> {
    return this.insightRepo.findByContactId(contactId)
  }
}
