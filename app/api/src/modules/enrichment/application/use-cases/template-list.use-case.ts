import type { AnalysisTemplateRepository } from '@modules/enrichment/domain/analysis-template.repository'
import type { AnalysisTemplate } from '@modules/enrichment/domain/entities/analysis-template'

export class TemplateListUseCase {
  constructor(private readonly templateRepo: AnalysisTemplateRepository) {}

  async execute(): Promise<AnalysisTemplate[]> {
    return this.templateRepo.list()
  }
}
