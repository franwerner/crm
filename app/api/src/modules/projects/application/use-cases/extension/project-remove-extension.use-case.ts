import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import { NotFoundError } from '@shared/errors'

export interface RemoveExtensionInput {
  projectId: string
  extId: string
}

export class ProjectRemoveExtensionUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: RemoveExtensionInput): Promise<Project> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const now = new Date()
    const updated = project.removeExtension(input.extId, now)
    await this.repo.removeExtension(updated, input.extId)
    return updated
  }
}
