import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import { NotFoundError } from '@shared/errors'

export interface UpdateExtensionInput {
  projectId: string
  extId: string
  additionalDays?: number
  reason?: string
  cost?: number | null
  billedAmount?: number | null
  grantedAt?: Date
}

export class ProjectUpdateExtensionUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: UpdateExtensionInput): Promise<Project> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const now = new Date()
    const updated = project.updateExtension(input.extId, {
      additionalDays: input.additionalDays,
      reason: input.reason,
      cost: input.cost,
      billedAmount: input.billedAmount,
      grantedAt: input.grantedAt,
    }, now)

    await this.repo.updateExtension(updated, input.extId)
    return updated
  }
}
