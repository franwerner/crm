import type { Context } from 'hono'
import type { TemplateCreateUseCase } from '@modules/enrichment/application/use-cases/template-create.use-case'
import type { TemplateListUseCase } from '@modules/enrichment/application/use-cases/template-list.use-case'
import type { TemplateUpdateUseCase } from '@modules/enrichment/application/use-cases/template-update.use-case'
import type { TemplateDeactivateUseCase } from '@modules/enrichment/application/use-cases/template-deactivate.use-case'
import type { TemplateIn, TemplateUpdateIn } from '@modules/enrichment/http/dto/template.dto'
import type { AnalysisTemplate } from '@modules/enrichment/domain/entities/analysis-template'

export interface TemplateUseCases {
  create: TemplateCreateUseCase
  list: TemplateListUseCase
  update: TemplateUpdateUseCase
  deactivate: TemplateDeactivateUseCase
}

function templateToResponse(template: AnalysisTemplate) {
  return {
    id: template.id,
    name: template.name,
    rubro: template.rubro,
    prompt: template.prompt,
    modelProvider: template.modelProvider,
    version: template.version,
    isActive: template.isActive,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  }
}

export class TemplateController {
  constructor(private readonly ucs: TemplateUseCases) {}

  async create(c: Context): Promise<Response> {
    const body = c.req.valid('json' as never) as TemplateIn
    const template = await this.ucs.create.execute({
      name: body.name,
      rubro: body.rubro,
      prompt: body.prompt,
      modelProvider: body.modelProvider,
    })
    return c.json(templateToResponse(template), 201)
  }

  async list(c: Context): Promise<Response> {
    const templates = await this.ucs.list.execute()
    return c.json(templates.map(templateToResponse), 200)
  }

  async update(c: Context): Promise<Response> {
    const id = c.req.param('id') as string
    const body = c.req.valid('json' as never) as TemplateUpdateIn
    const template = await this.ucs.update.execute({
      id,
      name: body.name,
      rubro: body.rubro,
      prompt: body.prompt,
      modelProvider: body.modelProvider,
    })
    return c.json(templateToResponse(template), 200)
  }

  async deactivate(c: Context): Promise<Response> {
    const id = c.req.param('id') as string
    const template = await this.ucs.deactivate.execute(id)
    return c.json(templateToResponse(template), 200)
  }
}
