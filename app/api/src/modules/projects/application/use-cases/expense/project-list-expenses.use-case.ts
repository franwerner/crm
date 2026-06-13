import type { ProjectExpense } from '@modules/projects/domain/entities/project-expense'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { Page } from '@shared/types/pagination'
import type { ListQuery } from '@shared/types/filters'
import { NotFoundError } from '@shared/errors'

export interface ListExpensesInput {
  projectId: string
  query: ListQuery
}

export class ProjectListExpensesUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: ListExpensesInput): Promise<Page<ProjectExpense>> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }
    return this.repo.findExpenses(input.projectId, input.query)
  }
}
