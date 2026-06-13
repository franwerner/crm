import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { projects, projectStateChanges, projectResponsibles, projectBudgetItems, projectExpenses, projectExtensions, projectDocuments } from '@shared/db/schema'
import { Project } from '@modules/projects/domain/project'
import type { ProjectStatus } from '@modules/projects/domain/types/project-status'
import type { ProjectResponsible } from '@modules/projects/domain/entities/project-responsible'
import type { ProjectStateChange } from '@modules/projects/domain/entities/project-state-change'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import { toProjectStateChange } from './project-state-change.repo-part'
import { toProjectResponsible, toResponsibleRow, fetchResponsiblesWithUser } from './project-responsible.repo-part'
import { toProjectBudgetItem } from './project-budget.repo-part'
import { toProjectExpense } from './project-expense.repo-part'
import { toProjectExtension } from './project-extension.repo-part'
import { toProjectDocument } from './project-document.repo-part'
import { toStateChangeRow } from './project-state-change.repo-part'

type ProjectRow = typeof projects.$inferSelect

export function toProjectRow(project: Project): typeof projects.$inferInsert {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    contactId: project.contactId,
    currency: project.currency,
    status: project.status,
    startDate: project.startDate,
    plannedEndDate: project.plannedEndDate,
    originalPlannedEndDate: project.originalPlannedEndDate,
    createdBy: project.createdBy,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    deletedAt: project.deletedAt,
  }
}

export class ProjectCoreRepoPart {
  constructor(private readonly db: Db) {}

  async updateProjectRow(
    tx: Parameters<Parameters<typeof this.db.transaction>[0]>[0],
    project: Project,
  ): Promise<void> {
    const row = toProjectRow(project)
    await tx
      .update(projects)
      .set({
        name: row.name,
        description: row.description,
        contactId: row.contactId,
        currency: row.currency,
        status: row.status,
        startDate: row.startDate,
        plannedEndDate: row.plannedEndDate,
        deletedAt: row.deletedAt,
        updatedAt: row.updatedAt,
      })
      .where(eq(projects.id, project.id))
  }

  async findById(id: string): Promise<Project | null> {
    const projectRow = await this.db.query.projects.findFirst({
      where: and(eq(projects.id, id), isNull(projects.deletedAt)),
    })

    if (!projectRow) return null

    const [stateChangeRows, responsibleWithUserRows, budgetItemRows, expenseRows, extensionRows, documentRows] = await Promise.all([
      this.db.query.projectStateChanges.findMany({
        where: eq(projectStateChanges.projectId, id),
      }),
      fetchResponsiblesWithUser(this.db, id),
      this.db.query.projectBudgetItems.findMany({
        where: eq(projectBudgetItems.projectId, id),
      }),
      this.db.query.projectExpenses.findMany({
        where: eq(projectExpenses.projectId, id),
      }),
      this.db
        .select()
        .from(projectExtensions)
        .where(eq(projectExtensions.projectId, id))
        .orderBy(asc(projectExtensions.grantedAt), asc(projectExtensions.createdAt)),
      this.db
        .select()
        .from(projectDocuments)
        .where(eq(projectDocuments.projectId, id))
        .orderBy(desc(projectDocuments.uploadedAt), desc(projectDocuments.createdAt)),
    ])

    return Project.reconstitute({
      id: projectRow.id,
      name: projectRow.name,
      description: projectRow.description,
      contactId: projectRow.contactId,
      currency: projectRow.currency,
      status: projectRow.status as ProjectStatus,
      startDate: projectRow.startDate,
      originalPlannedEndDate: projectRow.originalPlannedEndDate,
      createdBy: projectRow.createdBy,
      createdAt: projectRow.createdAt,
      updatedAt: projectRow.updatedAt,
      deletedAt: projectRow.deletedAt,
      stateChanges: stateChangeRows.map(toProjectStateChange),
      responsibles: responsibleWithUserRows.map((r) => toProjectResponsible(r, r.userName)),
      budgetItems: budgetItemRows.map(toProjectBudgetItem),
      expenses: expenseRows.map(toProjectExpense),
      extensions: extensionRows.map(toProjectExtension),
      documents: documentRows.map(toProjectDocument),
    })
  }

  async create(project: Project): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(projects).values(toProjectRow(project))
      if (project.responsibles.length > 0) {
        await tx.insert(projectResponsibles).values(project.responsibles.map(toResponsibleRow))
      }
    })
  }

  async updateProject(project: Project): Promise<void> {
    await this.db.transaction(async (tx) => {
      await this.updateProjectRow(tx, project)
    })
  }

  async appendStateChange(project: Project): Promise<void> {
    const newStateChanges = project.newStateChanges

    await this.db.transaction(async (tx) => {
      if (newStateChanges.length > 0) {
        await tx.insert(projectStateChanges).values(newStateChanges.map(toStateChangeRow))
      }
      await this.updateProjectRow(tx, project)
    })
  }

  async softDeleteMany(ids: string[], deletedAt: Date): Promise<void> {
    if (ids.length === 0) return
    await this.db
      .update(projects)
      .set({ deletedAt, updatedAt: deletedAt })
      .where(and(inArray(projects.id, ids), isNull(projects.deletedAt)))
  }
}
