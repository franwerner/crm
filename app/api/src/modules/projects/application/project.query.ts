import type { ProjectStatus } from '@modules/projects/domain/types/project-status'
import type { ProjectResponsibleRole } from '@modules/projects/domain/types/project-responsible-role'
import type { ListQuery } from '@shared/types/filters'
import type { Page, PageParams } from '@shared/types/pagination'

export interface ProjectResponsibleRef {
  userId: string
  userName: string
  role: ProjectResponsibleRole
}

export interface ProjectListItem {
  id: string
  name: string
  description: string | null
  contactId: string
  contactName: string | null
  currency: string
  status: ProjectStatus
  startDate: Date
  plannedEndDate: Date
  createdBy: string
  responsiblesCount: number
  leads: ProjectResponsibleRef[]
  createdAt: Date
  updatedAt: Date
}

export type ProjectListInput = ListQuery

export interface ProjectQueries {
  list(input: ProjectListInput): Promise<Page<ProjectListItem>>
}
