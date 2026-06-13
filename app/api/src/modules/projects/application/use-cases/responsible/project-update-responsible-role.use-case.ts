import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { ProjectResponsibleRole } from '@modules/projects/domain/types/project-responsible-role'
import { NotFoundError } from '@shared/errors'

export interface UpdateResponsibleRoleInput {
  projectId: string
  userId: string
  role: ProjectResponsibleRole
}

export class ProjectUpdateResponsibleRoleUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: UpdateResponsibleRoleInput): Promise<Project> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const now = new Date()
    const updated = project.updateResponsibleRole(input.userId, input.role, now)

    await this.repo.updateResponsibleRole(updated, input.userId)
    return updated
  }
}
