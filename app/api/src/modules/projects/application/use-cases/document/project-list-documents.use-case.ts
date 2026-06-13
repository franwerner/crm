import type { ProjectDocument } from '@modules/projects/domain/entities/project-document'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { Page } from '@shared/types/pagination'
import type { ListQuery } from '@shared/types/filters'
import { NotFoundError } from '@shared/errors'

export interface ListDocumentsInput {
  projectId: string
  query: ListQuery
}

export class ProjectListDocumentsUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: ListDocumentsInput): Promise<Page<ProjectDocument>> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }
    return this.repo.findDocuments(input.projectId, input.query)
  }
}
