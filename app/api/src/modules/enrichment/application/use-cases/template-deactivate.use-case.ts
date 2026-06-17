import type { AnalysisTemplateRepository } from '@modules/enrichment/domain/analysis-template.repository'
import type { AnalysisTemplate } from '@modules/enrichment/domain/entities/analysis-template'
import { NotFoundError } from '@shared/errors'

export class TemplateDeactivateUseCase {
  constructor(private readonly templateRepo: AnalysisTemplateRepository) {}

  async execute(id: string): Promise<AnalysisTemplate> {
    const template = await this.templateRepo.findById(id)
    if (!template) throw new NotFoundError(`Analysis template '${id}' not found`)

    const deactivated = template.deactivate(new Date())
    await this.templateRepo.save(deactivated)
    return deactivated
  }
}
