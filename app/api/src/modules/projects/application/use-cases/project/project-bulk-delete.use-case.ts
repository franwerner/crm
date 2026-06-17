import type { ProjectsRepository } from '@modules/projects/domain/project.repository'

export interface BulkDeleteProjectsInput {
  ids: string[]
}

export class ProjectBulkDeleteUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: BulkDeleteProjectsInput): Promise<void> {
    await this.repo.softDeleteMany(input.ids, new Date())
  }
}
