import type { ProjectQueries, ProjectKpisResult } from '@modules/projects/application/project.query'

export class ProjectKpisUseCase {
  constructor(private readonly queries: ProjectQueries) {}

  async execute(): Promise<ProjectKpisResult> {
    return this.queries.kpis()
  }
}
