import type { AnalysisTemplateRepository } from '@modules/enrichment/domain/analysis-template.repository'
import type { AnalysisTemplate } from '@modules/enrichment/domain/entities/analysis-template'
import { NotFoundError } from '@shared/errors'

export interface TemplateUpdateInput {
  id: string
  name?: string
  rubro?: string
  prompt?: string
  modelProvider?: string
}

export class TemplateUpdateUseCase {
  constructor(private readonly templateRepo: AnalysisTemplateRepository) {}

  async execute(input: TemplateUpdateInput): Promise<AnalysisTemplate> {
    const template = await this.templateRepo.findById(input.id)
    if (!template) throw new NotFoundError(`Analysis template '${input.id}' not found`)

    const updated = template.update(
      {
        name: input.name,
        rubro: input.rubro,
        prompt: input.prompt,
        modelProvider: input.modelProvider,
      },
      new Date(),
    )
    await this.templateRepo.save(updated)
    return updated
  }
}
