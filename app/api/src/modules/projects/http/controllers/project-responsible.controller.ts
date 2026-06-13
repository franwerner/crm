import type { Context } from 'hono'
import type { ProjectAddResponsibleUseCase } from '@modules/projects/application/use-cases/responsible/project-add-responsible.use-case'
import type { ProjectUpdateResponsibleRoleUseCase } from '@modules/projects/application/use-cases/responsible/project-update-responsible-role.use-case'
import type { ProjectRemoveResponsibleUseCase } from '@modules/projects/application/use-cases/responsible/project-remove-responsible.use-case'
import type { AddResponsibleRequest, UpdateResponsibleRoleRequest } from '@modules/projects/http/dto/in/project-responsible.in'
import { toProjectView } from './view-mappers'

export interface ProjectResponsibleUseCases {
  addResponsible: ProjectAddResponsibleUseCase
  updateResponsibleRole: ProjectUpdateResponsibleRoleUseCase
  removeResponsible: ProjectRemoveResponsibleUseCase
}

export class ProjectResponsibleController {
  constructor(private readonly ucs: ProjectResponsibleUseCases) {}

  async addResponsible(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as AddResponsibleRequest
    const assignedBy = c.get('userId') as string

    const project = await this.ucs.addResponsible.execute({
      projectId,
      userId: body.userId,
      role: body.role,
      assignedBy,
    })

    return c.json(toProjectView(project), 200)
  }

  async updateResponsibleRole(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const userId = c.req.param('userId') as string
    const body = c.req.valid('json' as never) as UpdateResponsibleRoleRequest

    const project = await this.ucs.updateResponsibleRole.execute({
      projectId,
      userId,
      role: body.role,
    })

    return c.json(toProjectView(project), 200)
  }

  async removeResponsible(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const userId = c.req.param('userId') as string

    const project = await this.ucs.removeResponsible.execute({ projectId, userId })

    return c.json(toProjectView(project), 200)
  }
}
