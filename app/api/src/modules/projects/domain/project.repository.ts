import type { Project } from '@modules/projects/domain/project'
import type { ProjectResponsible } from '@modules/projects/domain/entities/project-responsible'
import type { ProjectStateChange } from '@modules/projects/domain/entities/project-state-change'
import type { ProjectBudgetItem } from '@modules/projects/domain/entities/project-budget-item'
import type { ProjectExpense } from '@modules/projects/domain/entities/project-expense'
import type { ProjectExtension } from '@modules/projects/domain/entities/project-extension'
import type { ProjectDocument } from '@modules/projects/domain/entities/project-document'
import type { Page } from '@shared/types/pagination'
import type { ListQuery } from '@shared/types/filters'

export interface ProjectsRepository {
  findById(id: string): Promise<Project | null>
  create(project: Project): Promise<void>
  updateProject(project: Project): Promise<void>
  appendStateChange(project: Project): Promise<void>
  addResponsible(project: Project, responsible: ProjectResponsible): Promise<void>
  updateResponsibleRole(project: Project, userId: string): Promise<void>
  removeResponsible(project: Project, userId: string): Promise<void>
  softDeleteMany(ids: string[], deletedAt: Date): Promise<void>
  findStateChanges(projectId: string, params: ListQuery): Promise<Page<ProjectStateChange>>
  addBudgetItem(project: Project, item: ProjectBudgetItem): Promise<void>
  updateBudgetItem(project: Project, itemId: string): Promise<void>
  removeBudgetItem(project: Project, itemId: string): Promise<void>
  addExpense(project: Project, expense: ProjectExpense): Promise<void>
  updateExpense(project: Project, expenseId: string): Promise<void>
  removeExpense(project: Project, expenseId: string): Promise<void>
  findBudgetItems(projectId: string, params: ListQuery): Promise<Page<ProjectBudgetItem>>
  findExpenses(projectId: string, params: ListQuery): Promise<Page<ProjectExpense>>
  addExtension(project: Project, extension: ProjectExtension): Promise<void>
  updateExtension(project: Project, extId: string): Promise<void>
  removeExtension(project: Project, extId: string): Promise<void>
  findExtensions(projectId: string, params: ListQuery): Promise<Page<ProjectExtension>>
  addDocument(project: Project, document: ProjectDocument): Promise<void>
  deleteDocument(project: Project, documentId: string): Promise<void>
  findDocumentById(id: string): Promise<ProjectDocument | null>
  findDocuments(projectId: string, params: ListQuery): Promise<Page<ProjectDocument>>
}
