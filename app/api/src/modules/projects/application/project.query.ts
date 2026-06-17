import type { ProjectStatus } from '@modules/projects/domain/types/project-status'
import type { ProjectResponsibleRole } from '@modules/projects/domain/types/project-responsible-role'
import type { ListQuery } from '@shared/types/filters'
import type { Page, PageParams } from '@shared/types/pagination'

export interface ProjectKpiState {
  state: ProjectStatus
  current: number
  previous: number
}

export interface ProjectKpisTotal {
  count: number
  current: number
  previous: number
}

export interface ProjectKpisResult {
  total: ProjectKpisTotal
  states: ProjectKpiState[]
}

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
  createdByName: string | null
  responsiblesCount: number
  leads: ProjectResponsibleRef[]
  createdAt: Date
  updatedAt: Date
}

export type ProjectListInput = ListQuery

export interface ProjectCreatorRef {
  id: string
  name: string
}

export interface ProjectQueries {
  list(input: ProjectListInput): Promise<Page<ProjectListItem>>
  kpis(): Promise<ProjectKpisResult>
  findCreatorRef(userId: string): Promise<ProjectCreatorRef | null>
}
