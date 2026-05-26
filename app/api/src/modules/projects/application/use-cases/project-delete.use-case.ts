import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import { NotFoundError } from '@shared/errors'

export interface DeleteProjectInput {
  id: string
}

export class ProjectDeleteUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: DeleteProjectInput): Promise<void> {
    const project = await this.repo.findById(input.id)
    if (!project) {
      throw new NotFoundError(`Project ${input.id} not found`)
    }
    await this.repo.softDeleteMany([input.id], new Date())
  }
}
