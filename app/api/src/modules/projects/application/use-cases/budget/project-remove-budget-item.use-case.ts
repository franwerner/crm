import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import { NotFoundError } from '@shared/errors'

export interface RemoveBudgetItemInput {
  projectId: string
  itemId: string
}

export class ProjectRemoveBudgetItemUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: RemoveBudgetItemInput): Promise<Project> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const now = new Date()
    const updated = project.removeBudgetItem(input.itemId, now)

    await this.repo.removeBudgetItem(updated, input.itemId)
    return updated
  }
}
