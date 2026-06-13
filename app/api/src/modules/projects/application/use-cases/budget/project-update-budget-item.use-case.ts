import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import { NotFoundError } from '@shared/errors'

export interface UpdateBudgetItemInput {
  projectId: string
  itemId: string
  concept?: string
  amountMinor?: number
}

export class ProjectUpdateBudgetItemUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: UpdateBudgetItemInput): Promise<Project> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const now = new Date()
    const updated = project.updateBudgetItem(input.itemId, { concept: input.concept, amountMinor: input.amountMinor }, now)

    await this.repo.updateBudgetItem(updated, input.itemId)
    return updated
  }
}
