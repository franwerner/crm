import type { Db } from '@shared/db/client'
import type { Project } from '@modules/projects/domain/project'
import type { ProjectResponsible } from '@modules/projects/domain/entities/project-responsible'
import type { ProjectStateChange } from '@modules/projects/domain/entities/project-state-change'
import type { ProjectBudgetItem } from '@modules/projects/domain/entities/project-budget-item'
import type { ProjectExpense } from '@modules/projects/domain/entities/project-expense'
import type { ProjectExtension } from '@modules/projects/domain/entities/project-extension'
import type { ProjectDocument } from '@modules/projects/domain/entities/project-document'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { Page } from '@shared/types/pagination'
import type { ListQuery } from '@shared/types/filters'
import { ProjectCoreRepoPart } from './repositories/project-core.repo-part'
import { ProjectStateChangeRepoPart } from './repositories/project-state-change.repo-part'
import { ProjectResponsibleRepoPart } from './repositories/project-responsible.repo-part'
import { ProjectBudgetRepoPart } from './repositories/project-budget.repo-part'
import { ProjectExpenseRepoPart } from './repositories/project-expense.repo-part'
import { ProjectExtensionRepoPart } from './repositories/project-extension.repo-part'
import { ProjectDocumentRepoPart } from './repositories/project-document.repo-part'

export class DrizzleProjectsRepository implements ProjectsRepository {
  private readonly core: ProjectCoreRepoPart
  private readonly stateChange: ProjectStateChangeRepoPart
  private readonly responsible: ProjectResponsibleRepoPart
  private readonly budget: ProjectBudgetRepoPart
  private readonly expense: ProjectExpenseRepoPart
  private readonly extension: ProjectExtensionRepoPart
  private readonly document: ProjectDocumentRepoPart

  constructor(db: Db) {
    this.core = new ProjectCoreRepoPart(db)
    this.stateChange = new ProjectStateChangeRepoPart(db)
    this.responsible = new ProjectResponsibleRepoPart(db)
    this.budget = new ProjectBudgetRepoPart(db)
    this.expense = new ProjectExpenseRepoPart(db)
    this.extension = new ProjectExtensionRepoPart(db)
    this.document = new ProjectDocumentRepoPart(db)
  }

  findById(id: string): Promise<Project | null> {
    return this.core.findById(id)
  }

  create(project: Project): Promise<void> {
    return this.core.create(project)
  }

  updateProject(project: Project): Promise<void> {
    return this.core.updateProject(project)
  }

  appendStateChange(project: Project): Promise<void> {
    return this.core.appendStateChange(project)
  }

  softDeleteMany(ids: string[], deletedAt: Date): Promise<void> {
    return this.core.softDeleteMany(ids, deletedAt)
  }

  findStateChanges(projectId: string, params: ListQuery): Promise<Page<ProjectStateChange>> {
    return this.stateChange.findStateChanges(projectId, params)
  }

  addResponsible(project: Project, responsible: ProjectResponsible): Promise<void> {
    return this.responsible.addResponsible(project, responsible)
  }

  updateResponsibleRole(project: Project, userId: string): Promise<void> {
    return this.responsible.updateResponsibleRole(project, userId)
  }

  removeResponsible(project: Project, userId: string): Promise<void> {
    return this.responsible.removeResponsible(project, userId)
  }

  addBudgetItem(project: Project, item: ProjectBudgetItem): Promise<void> {
    return this.budget.addBudgetItem(project, item)
  }

  updateBudgetItem(project: Project, itemId: string): Promise<void> {
    return this.budget.updateBudgetItem(project, itemId)
  }

  removeBudgetItem(project: Project, itemId: string): Promise<void> {
    return this.budget.removeBudgetItem(project, itemId)
  }

  findBudgetItems(projectId: string, params: ListQuery): Promise<Page<ProjectBudgetItem>> {
    return this.budget.findBudgetItems(projectId, params)
  }

  addExpense(project: Project, expense: ProjectExpense): Promise<void> {
    return this.expense.addExpense(project, expense)
  }

  updateExpense(project: Project, expenseId: string): Promise<void> {
    return this.expense.updateExpense(project, expenseId)
  }

  removeExpense(project: Project, expenseId: string): Promise<void> {
    return this.expense.removeExpense(project, expenseId)
  }

  findExpenses(projectId: string, params: ListQuery): Promise<Page<ProjectExpense>> {
    return this.expense.findExpenses(projectId, params)
  }

  addExtension(project: Project, extension: ProjectExtension): Promise<void> {
    return this.extension.addExtension(project, extension)
  }

  updateExtension(project: Project, extId: string): Promise<void> {
    return this.extension.updateExtension(project, extId)
  }

  removeExtension(project: Project, extId: string): Promise<void> {
    return this.extension.removeExtension(project, extId)
  }

  findExtensions(projectId: string, params: ListQuery): Promise<Page<ProjectExtension>> {
    return this.extension.findExtensions(projectId, params)
  }

  addDocument(project: Project, document: ProjectDocument): Promise<void> {
    return this.document.addDocument(project, document)
  }

  deleteDocument(project: Project, documentId: string): Promise<void> {
    return this.document.deleteDocument(project, documentId)
  }

  findDocumentById(id: string): Promise<ProjectDocument | null> {
    return this.document.findDocumentById(id)
  }

  findDocuments(projectId: string, params: ListQuery): Promise<Page<ProjectDocument>> {
    return this.document.findDocuments(projectId, params)
  }
}
