import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { ProjectBudgetItem } from '@modules/projects/domain/entities/project-budget-item'
import { NotFoundError } from '@shared/errors'
import { newId } from '@shared/utils/id'

export interface AddBudgetItemInput {
  projectId: string
  concept: string
  amountMinor: number
}

export class ProjectAddBudgetItemUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: AddBudgetItemInput): Promise<Project> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const now = new Date()
    const item: ProjectBudgetItem = {
      id: newId(),
      projectId: input.projectId,
      concept: input.concept,
      amountMinor: input.amountMinor,
      createdAt: now,
      updatedAt: now,
    }

    const updated = project.addBudgetItem(item)
    await this.repo.addBudgetItem(updated, item)
    return updated
  }
}
