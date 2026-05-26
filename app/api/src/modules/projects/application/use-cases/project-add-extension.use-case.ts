import type { Project } from '@modules/projects/domain/project'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { ProjectExtension } from '@modules/projects/domain/entities/project-extension'
import { NotFoundError } from '@shared/errors'
import { newId } from '@shared/utils/id'

export interface AddExtensionInput {
  projectId: string
  additionalDays: number
  reason: string
  cost?: number | null
  billedAmount?: number | null
  grantedAt: Date
  grantedBy: string
}

export class ProjectAddExtensionUseCase {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: AddExtensionInput): Promise<Project> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const now = new Date()
    const currentEnd = project.plannedEndDate
    const appliedEndDate = new Date(currentEnd)
    appliedEndDate.setUTCDate(appliedEndDate.getUTCDate() + input.additionalDays)

    const extension: ProjectExtension = {
      id: newId(),
      projectId: input.projectId,
      additionalDays: input.additionalDays,
      appliedEndDate,
      reason: input.reason,
      cost: input.cost ?? null,
      billedAmount: input.billedAmount ?? null,
      grantedAt: input.grantedAt,
      grantedBy: input.grantedBy,
      createdAt: now,
      updatedAt: now,
    }

    const updated = project.addExtension(extension)
    await this.repo.addExtension(updated, extension)
    return updated
  }
}
