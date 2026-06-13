import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import { NotFoundError } from '@shared/errors'

export interface UpdateExpenseInput {
  projectId: string
  expenseId: string
  concept?: string
  amountMinor?: number
  incurredAt?: Date
}

export class ProjectUpdateExpenseUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: UpdateExpenseInput): Promise<Project> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const now = new Date()
    const updated = project.updateExpense(
      input.expenseId,
      { concept: input.concept, amountMinor: input.amountMinor, incurredAt: input.incurredAt },
      now,
    )

    await this.repo.updateExpense(updated, input.expenseId)
    return updated
  }
}
