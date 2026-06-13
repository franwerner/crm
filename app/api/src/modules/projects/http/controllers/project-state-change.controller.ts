import type { Context } from 'hono'
import type { ProjectChangeStateUseCase } from '@modules/projects/application/use-cases/project/project-change-state.use-case'
import type { ProjectListStateChangesUseCase } from '@modules/projects/application/use-cases/state-change/project-list-state-changes.use-case'
import type { ChangeProjectStateRequest } from '@modules/projects/http/dto/in/project-change-state.in'
import type { ListQuery } from '@shared/types/filters'
import { toProjectView, toStateChangeView } from './view-mappers'

export interface ProjectStateChangeUseCases {
  changeState: ProjectChangeStateUseCase
  listStateChanges: ProjectListStateChangesUseCase
}

export class ProjectStateChangeController {
  constructor(private readonly ucs: ProjectStateChangeUseCases) {}

  async changeState(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as ChangeProjectStateRequest
    const userId = c.get('userId') as string

    const project = await this.ucs.changeState.execute({
      projectId,
      newState: body.newState,
      userId,
    })

    return c.json(toProjectView(project), 200)
  }

  async listStateChanges(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as ListQuery

    const page = await this.ucs.listStateChanges.execute({
      projectId,
      query,
    })

    return c.json(
      {
        items: page.items.map(toStateChangeView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }
}
