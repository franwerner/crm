import type { AnalysisTemplateRepository } from '@modules/enrichment/domain/analysis-template.repository'
import { AnalysisTemplate } from '@modules/enrichment/domain/entities/analysis-template'
import { newId } from '@shared/utils/id'

export interface TemplateCreateInput {
  name: string
  rubro: string
  prompt: string
  modelProvider: string
}

export class TemplateCreateUseCase {
  constructor(private readonly templateRepo: AnalysisTemplateRepository) {}

  async execute(input: TemplateCreateInput): Promise<AnalysisTemplate> {
    const now = new Date()
    const template = AnalysisTemplate.create({
      id: newId(),
      name: input.name,
      rubro: input.rubro,
      prompt: input.prompt,
      modelProvider: input.modelProvider,
      createdAt: now,
      updatedAt: now,
    })
    await this.templateRepo.save(template)
    return template
  }
}
