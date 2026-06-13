import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import { NotFoundError } from '@shared/errors'

export interface RemoveResponsibleInput {
  projectId: string
  userId: string
}

export class ProjectRemoveResponsibleUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: RemoveResponsibleInput): Promise<Project> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const now = new Date()
    const updated = project.removeResponsible(input.userId, now)

    await this.repo.removeResponsible(updated, input.userId)
    return updated
  }
}
