import type { Context } from 'hono'
import type { ProjectCreateUseCase } from '@modules/projects/application/use-cases/project/project-create.use-case'
import type { ProjectGetUseCase } from '@modules/projects/application/use-cases/project/project-get.use-case'
import type { ProjectListUseCase } from '@modules/projects/application/use-cases/project/project-list.use-case'
import type { ProjectUpdateUseCase } from '@modules/projects/application/use-cases/project/project-update.use-case'
import type { ProjectDeleteUseCase } from '@modules/projects/application/use-cases/project/project-delete.use-case'
import type { CreateProjectRequest } from '@modules/projects/http/dto/in/project-create.in'
import type { UpdateProjectRequest } from '@modules/projects/http/dto/in/project-update.in'
import type { ProjectListInput } from '@modules/projects/application/project.query'
import { toProjectView, toProjectListView } from './view-mappers'

export interface ProjectCoreUseCases {
  create: ProjectCreateUseCase
  get: ProjectGetUseCase
  list: ProjectListUseCase
  update: ProjectUpdateUseCase
  delete: ProjectDeleteUseCase
}

export class ProjectCoreController {
  constructor(private readonly ucs: ProjectCoreUseCases) {}

  async createProject(c: Context): Promise<Response> {
    const body = c.req.valid('json' as never) as CreateProjectRequest
    const userId = c.get('userId') as string

    const project = await this.ucs.create.execute({
      name: body.name,
      description: body.description,
      contactId: body.contactId,
      currency: body.currency.toUpperCase(),
      startDate: new Date(body.startDate),
      plannedEndDate: new Date(body.plannedEndDate),
      createdBy: userId,
    })

    return c.json(toProjectView(project), 201)
  }

  async getProject(c: Context): Promise<Response> {
    const id = c.req.param('id') as string

    const project = await this.ucs.get.execute({ id })

    return c.json(toProjectView(project), 200)
  }

  async listProjects(c: Context): Promise<Response> {
    const query = c.req.valid('query' as never) as ProjectListInput

    const page = await this.ucs.list.execute(query)

    return c.json(
      {
        items: page.items.map(toProjectListView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }

  async updateProject(c: Context): Promise<Response> {
    const id = c.req.param('id') as string
    const body = c.req.valid('json' as never) as UpdateProjectRequest

    const project = await this.ucs.update.execute({
      id,
      name: body.name,
      description: body.description,
      contactId: body.contactId,
      currency: body.currency !== undefined ? body.currency.toUpperCase() : undefined,
      startDate: body.startDate !== undefined ? new Date(body.startDate) : undefined,
      plannedEndDate: body.plannedEndDate !== undefined ? new Date(body.plannedEndDate) : undefined,
    })

    return c.json(toProjectView(project), 200)
  }

  async deleteProject(c: Context): Promise<Response> {
    const id = c.req.param('id') as string

    await this.ucs.delete.execute({ id })

    return c.body(null, 204)
  }
}
