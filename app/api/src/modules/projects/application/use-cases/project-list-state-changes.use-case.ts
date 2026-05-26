import type { ProjectStateChange } from '@modules/projects/domain/entities/project-state-change'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { Page } from '@shared/types/pagination'
import type { ListQuery } from '@shared/types/filters'
import { NotFoundError } from '@shared/errors'

export interface ListProjectStateChangesInput {
  projectId: string
  query: ListQuery
}

export class ProjectListStateChangesUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: ListProjectStateChangesInput): Promise<Page<ProjectStateChange>> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }
    return this.repo.findStateChanges(input.projectId, input.query)
  }
}
