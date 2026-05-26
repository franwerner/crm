import { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { ProjectResponsible } from '@modules/projects/domain/entities/project-responsible'
import { newId } from '@shared/utils/id'

export interface CreateProjectInput {
  name: string
  description?: string | null
  contactId: string
  currency: string
  startDate: Date
  plannedEndDate: Date
  createdBy: string
}

export class ProjectCreateUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    const now = new Date()
    const projectId = newId()

    const initialResponsible: ProjectResponsible = {
      id: newId(),
      projectId,
      userId: input.createdBy,
      userName: null,
      role: 'Lead',
      assignedBy: input.createdBy,
      assignedAt: now,
      createdAt: now,
      updatedAt: now,
    }

    const project = Project.create({
      id: projectId,
      name: input.name,
      description: input.description,
      contactId: input.contactId,
      currency: input.currency,
      startDate: input.startDate,
      plannedEndDate: input.plannedEndDate,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      responsibles: [initialResponsible],
    })

    await this.repo.create(project)
    return project
  }
}
