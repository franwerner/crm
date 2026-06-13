import type { Context } from 'hono'
import type { ProjectAddBudgetItemUseCase } from '@modules/projects/application/use-cases/budget/project-add-budget-item.use-case'
import type { ProjectUpdateBudgetItemUseCase } from '@modules/projects/application/use-cases/budget/project-update-budget-item.use-case'
import type { ProjectRemoveBudgetItemUseCase } from '@modules/projects/application/use-cases/budget/project-remove-budget-item.use-case'
import type { ProjectListBudgetItemsUseCase } from '@modules/projects/application/use-cases/budget/project-list-budget-items.use-case'
import type { AddBudgetItemRequest, UpdateBudgetItemRequest } from '@modules/projects/http/dto/in/project-budget-item.in'
import type { ListQuery } from '@shared/types/filters'
import { toProjectView, toBudgetItemView } from './view-mappers'

export interface ProjectBudgetUseCases {
  addBudgetItem: ProjectAddBudgetItemUseCase
  updateBudgetItem: ProjectUpdateBudgetItemUseCase
  removeBudgetItem: ProjectRemoveBudgetItemUseCase
  listBudgetItems: ProjectListBudgetItemsUseCase
}

export class ProjectBudgetController {
  constructor(private readonly ucs: ProjectBudgetUseCases) {}

  async addBudgetItem(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as AddBudgetItemRequest

    const project = await this.ucs.addBudgetItem.execute({
      projectId,
      concept: body.concept,
      amountMinor: body.amountMinor,
    })

    return c.json(toProjectView(project), 200)
  }

  async updateBudgetItem(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const itemId = c.req.param('itemId') as string
    const body = c.req.valid('json' as never) as UpdateBudgetItemRequest

    const project = await this.ucs.updateBudgetItem.execute({
      projectId,
      itemId,
      concept: body.concept,
      amountMinor: body.amountMinor,
    })

    return c.json(toProjectView(project), 200)
  }

  async removeBudgetItem(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const itemId = c.req.param('itemId') as string

    const project = await this.ucs.removeBudgetItem.execute({ projectId, itemId })

    return c.json(toProjectView(project), 200)
  }

  async listBudgetItems(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as ListQuery

    const page = await this.ucs.listBudgetItems.execute({ projectId, query })

    return c.json(
      {
        items: page.items.map(toBudgetItemView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }
}
