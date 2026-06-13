import type { Context } from 'hono'
import type { ProjectAddExtensionUseCase } from '@modules/projects/application/use-cases/extension/project-add-extension.use-case'
import type { ProjectUpdateExtensionUseCase } from '@modules/projects/application/use-cases/extension/project-update-extension.use-case'
import type { ProjectRemoveExtensionUseCase } from '@modules/projects/application/use-cases/extension/project-remove-extension.use-case'
import type { ProjectListExtensionsUseCase } from '@modules/projects/application/use-cases/extension/project-list-extensions.use-case'
import type { AddExtensionRequest, UpdateExtensionRequest } from '@modules/projects/http/dto/in/project-extension.in'
import type { ListQuery } from '@shared/types/filters'
import { toProjectView, toExtensionView } from './view-mappers'

export interface ProjectExtensionUseCases {
  addExtension: ProjectAddExtensionUseCase
  updateExtension: ProjectUpdateExtensionUseCase
  removeExtension: ProjectRemoveExtensionUseCase
  listExtensions: ProjectListExtensionsUseCase
}

export class ProjectExtensionController {
  constructor(private readonly ucs: ProjectExtensionUseCases) {}

  async addExtension(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as AddExtensionRequest
    const grantedBy = c.get('userId') as string

    const project = await this.ucs.addExtension.execute({
      projectId,
      additionalDays: body.additionalDays,
      reason: body.reason,
      cost: body.cost,
      billedAmount: body.billedAmount,
      grantedAt: new Date(body.grantedAt),
      grantedBy,
    })

    return c.json(toProjectView(project), 200)
  }

  async updateExtension(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const extId = c.req.param('extId') as string
    const body = c.req.valid('json' as never) as UpdateExtensionRequest

    const project = await this.ucs.updateExtension.execute({
      projectId,
      extId,
      additionalDays: body.additionalDays,
      reason: body.reason,
      cost: body.cost,
      billedAmount: body.billedAmount,
      grantedAt: body.grantedAt !== undefined ? new Date(body.grantedAt) : undefined,
    })

    return c.json(toProjectView(project), 200)
  }

  async removeExtension(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const extId = c.req.param('extId') as string

    const project = await this.ucs.removeExtension.execute({ projectId, extId })

    return c.json(toProjectView(project), 200)
  }

  async listExtensions(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as ListQuery

    const page = await this.ucs.listExtensions.execute({ projectId, query })

    return c.json(
      {
        items: page.items.map(toExtensionView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }
}
