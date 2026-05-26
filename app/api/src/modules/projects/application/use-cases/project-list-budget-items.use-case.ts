import type { ProjectBudgetItem } from '@modules/projects/domain/entities/project-budget-item'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { Page } from '@shared/types/pagination'
import type { ListQuery } from '@shared/types/filters'
import { NotFoundError } from '@shared/errors'

export interface ListBudgetItemsInput {
  projectId: string
  query: ListQuery
}

export class ProjectListBudgetItemsUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: ListBudgetItemsInput): Promise<Page<ProjectBudgetItem>> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }
    return this.repo.findBudgetItems(input.projectId, input.query)
  }
}
