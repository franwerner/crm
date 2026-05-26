import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { ProjectResponsibleRole } from '@modules/projects/domain/types/project-responsible-role'
import type { ProjectResponsible } from '@modules/projects/domain/entities/project-responsible'
import { NotFoundError } from '@shared/errors'
import { newId } from '@shared/utils/id'

export interface AddResponsibleInput {
  projectId: string
  userId: string
  role: ProjectResponsibleRole
  assignedBy: string
}

export class ProjectAddResponsibleUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: AddResponsibleInput): Promise<Project> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const now = new Date()
    const responsible: ProjectResponsible = {
      id: newId(),
      projectId: input.projectId,
      userId: input.userId,
      userName: null,
      role: input.role,
      assignedBy: input.assignedBy,
      assignedAt: now,
      createdAt: now,
      updatedAt: now,
    }

    const updated = project.addResponsible(responsible)
    await this.repo.addResponsible(updated, responsible)
    return updated
  }
}
