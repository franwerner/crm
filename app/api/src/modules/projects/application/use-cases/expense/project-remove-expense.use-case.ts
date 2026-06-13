import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import { NotFoundError } from '@shared/errors'

export interface RemoveExpenseInput {
  projectId: string
  expenseId: string
}

export class ProjectRemoveExpenseUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: RemoveExpenseInput): Promise<Project> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const now = new Date()
    const updated = project.removeExpense(input.expenseId, now)

    await this.repo.removeExpense(updated, input.expenseId)
    return updated
  }
}
