import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import { NotFoundError } from '@shared/errors'

export interface GetProjectInput {
  id: string
}

export class ProjectGetUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: GetProjectInput): Promise<Project> {
    const project = await this.repo.findById(input.id)
    if (!project) {
      throw new NotFoundError(`Project ${input.id} not found`)
    }
    return project
  }
}
