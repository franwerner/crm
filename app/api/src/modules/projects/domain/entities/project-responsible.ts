import type { ProjectResponsibleRole } from '@modules/projects/domain/types/project-responsible-role'

export interface ProjectResponsible {
  readonly id: string
  readonly projectId: string
  readonly userId: string
  readonly userName: string | null
  readonly role: ProjectResponsibleRole
  readonly assignedBy: string
  readonly assignedAt: Date
  readonly createdAt: Date
  readonly updatedAt: Date
}
