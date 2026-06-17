import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { ProjectCreatorRef, ProjectQueries } from '@modules/projects/application/project.query'
import { NotFoundError } from '@shared/errors'

export interface GetProjectInput {
  id: string
}

export interface GetProjectResult {
  project: Project
  creator: ProjectCreatorRef | null
}

export class ProjectGetUseCase {
  constructor(
    private readonly repo: ProjectsRepository,
    private readonly queries: ProjectQueries,
  ) {}

  async execute(input: GetProjectInput): Promise<GetProjectResult> {
    const project = await this.repo.findById(input.id)
    if (!project) {
      throw new NotFoundError(`Project ${input.id} not found`)
    }
    const creator = await this.queries.findCreatorRef(project.createdBy)
    return { project, creator }
  }
}
