import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import { NotFoundError } from '@shared/errors'

export interface UpdateProjectInput {
  id: string
  name?: string
  description?: string | null
  contactId?: string
  currency?: string
  startDate?: Date
  plannedEndDate?: Date
}

export class ProjectUpdateUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: UpdateProjectInput): Promise<Project> {
    const project = await this.repo.findById(input.id)
    if (!project) {
      throw new NotFoundError(`Project ${input.id} not found`)
    }

    const { id: _id, ...params } = input
    const updated = project.update(params, new Date())

    await this.repo.updateProject(updated)
    return updated
  }
}
