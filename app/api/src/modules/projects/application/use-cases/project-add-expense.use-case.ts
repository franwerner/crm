import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { ProjectExpense } from '@modules/projects/domain/entities/project-expense'
import { NotFoundError } from '@shared/errors'
import { newId } from '@shared/utils/id'

export interface AddExpenseInput {
  projectId: string
  concept: string
  amountMinor: number
  incurredAt: Date
}

export class ProjectAddExpenseUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: AddExpenseInput): Promise<Project> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const now = new Date()
    const expense: ProjectExpense = {
      id: newId(),
      projectId: input.projectId,
      concept: input.concept,
      amountMinor: input.amountMinor,
      incurredAt: input.incurredAt,
      createdAt: now,
      updatedAt: now,
    }

    const updated = project.addExpense(expense)
    await this.repo.addExpense(updated, expense)
    return updated
  }
}
