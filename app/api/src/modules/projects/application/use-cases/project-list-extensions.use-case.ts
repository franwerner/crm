import type { ProjectExtension } from '@modules/projects/domain/entities/project-extension'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { Page } from '@shared/types/pagination'
import type { ListQuery } from '@shared/types/filters'
import { NotFoundError } from '@shared/errors'

export interface ListExtensionsInput {
  projectId: string
  query: ListQuery
}

export class ProjectListExtensionsUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: ListExtensionsInput): Promise<Page<ProjectExtension>> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }
    return this.repo.findExtensions(input.projectId, input.query)
  }
}
