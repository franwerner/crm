import type { Context } from 'hono'
import type { ProjectAddExpenseUseCase } from '@modules/projects/application/use-cases/expense/project-add-expense.use-case'
import type { ProjectUpdateExpenseUseCase } from '@modules/projects/application/use-cases/expense/project-update-expense.use-case'
import type { ProjectRemoveExpenseUseCase } from '@modules/projects/application/use-cases/expense/project-remove-expense.use-case'
import type { ProjectListExpensesUseCase } from '@modules/projects/application/use-cases/expense/project-list-expenses.use-case'
import type { AddExpenseRequest, UpdateExpenseRequest } from '@modules/projects/http/dto/in/project-expense.in'
import type { ListQuery } from '@shared/types/filters'
import { toProjectView, toExpenseView } from './view-mappers'

export interface ProjectExpenseUseCases {
  addExpense: ProjectAddExpenseUseCase
  updateExpense: ProjectUpdateExpenseUseCase
  removeExpense: ProjectRemoveExpenseUseCase
  listExpenses: ProjectListExpensesUseCase
}

export class ProjectExpenseController {
  constructor(private readonly ucs: ProjectExpenseUseCases) {}

  async addExpense(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as AddExpenseRequest

    const project = await this.ucs.addExpense.execute({
      projectId,
      concept: body.concept,
      amountMinor: body.amountMinor,
      incurredAt: new Date(body.incurredAt),
    })

    return c.json(toProjectView(project), 200)
  }

  async updateExpense(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const expenseId = c.req.param('expenseId') as string
    const body = c.req.valid('json' as never) as UpdateExpenseRequest

    const project = await this.ucs.updateExpense.execute({
      projectId,
      expenseId,
      concept: body.concept,
      amountMinor: body.amountMinor,
      incurredAt: body.incurredAt !== undefined ? new Date(body.incurredAt) : undefined,
    })

    return c.json(toProjectView(project), 200)
  }

  async removeExpense(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const expenseId = c.req.param('expenseId') as string

    const project = await this.ucs.removeExpense.execute({ projectId, expenseId })

    return c.json(toProjectView(project), 200)
  }

  async listExpenses(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as ListQuery

    const page = await this.ucs.listExpenses.execute({ projectId, query })

    return c.json(
      {
        items: page.items.map(toExpenseView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }
}
