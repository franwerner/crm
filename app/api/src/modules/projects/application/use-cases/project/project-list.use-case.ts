import type { ProjectQueries, ProjectListInput, ProjectListItem } from '@modules/projects/application/project.query'
import type { Page } from '@shared/types/pagination'

export class ProjectListUseCase {
  constructor(private readonly queries: ProjectQueries) {}

  async execute(input: ProjectListInput): Promise<Page<ProjectListItem>> {
    return this.queries.list(input)
  }
}
