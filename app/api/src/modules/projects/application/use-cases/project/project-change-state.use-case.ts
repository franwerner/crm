import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { ProjectStatus } from '@modules/projects/domain/types/project-status'
import { NotFoundError } from '@shared/errors'
import { newId } from '@shared/utils/id'

export interface ChangeProjectStateInput {
  projectId: string
  newState: ProjectStatus
  userId: string
  note?: string
}

export class ProjectChangeStateUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: ChangeProjectStateInput): Promise<Project> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const now = new Date()
    const updated = project.changeState({
      stateChangeId: newId(),
      newState: input.newState,
      cause: { kind: 'manual', userId: input.userId, note: input.note },
      now,
    })

    await this.repo.appendStateChange(updated)
    return updated
  }
}
