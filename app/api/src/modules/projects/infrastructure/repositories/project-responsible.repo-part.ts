import { and, eq } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { projectResponsibles, users } from '@shared/db/schema'
import type { Project } from '@modules/projects/domain/project'
import type { ProjectResponsible } from '@modules/projects/domain/entities/project-responsible'
import type { ProjectResponsibleRole } from '@modules/projects/domain/types/project-responsible-role'
import { projects } from '@shared/db/schema'

type ProjectResponsibleRow = typeof projectResponsibles.$inferSelect

export function toProjectResponsible(row: ProjectResponsibleRow, userName?: string | null): ProjectResponsible {
  return {
    id: row.id,
    projectId: row.projectId,
    userId: row.userId,
    userName: userName ?? null,
    role: row.role as ProjectResponsibleRole,
    assignedBy: row.assignedBy,
    assignedAt: row.assignedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function toResponsibleRow(r: ProjectResponsible): typeof projectResponsibles.$inferInsert {
  return {
    id: r.id,
    projectId: r.projectId,
    userId: r.userId,
    role: r.role,
    assignedBy: r.assignedBy,
    assignedAt: r.assignedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

export type ResponsibleRowWithUser = ProjectResponsibleRow & { userName?: string | null }

export async function fetchResponsiblesWithUser(db: Db, projectId: string): Promise<ResponsibleRowWithUser[]> {
  const rows = await db
    .select({
      id: projectResponsibles.id,
      projectId: projectResponsibles.projectId,
      userId: projectResponsibles.userId,
      role: projectResponsibles.role,
      assignedBy: projectResponsibles.assignedBy,
      assignedAt: projectResponsibles.assignedAt,
      createdAt: projectResponsibles.createdAt,
      updatedAt: projectResponsibles.updatedAt,
      userName: users.name,
    })
    .from(projectResponsibles)
    .leftJoin(users, eq(users.id, projectResponsibles.userId))
    .where(eq(projectResponsibles.projectId, projectId))
  return rows
}

export class ProjectResponsibleRepoPart {
  constructor(private readonly db: Db) {}

  async addResponsible(project: Project, responsible: ProjectResponsible): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(projectResponsibles).values(toResponsibleRow(responsible))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async updateResponsibleRole(project: Project, userId: string): Promise<void> {
    const responsible = project.responsibles.find((r) => r.userId === userId)
    if (!responsible) return

    await this.db.transaction(async (tx) => {
      await tx
        .update(projectResponsibles)
        .set({ role: responsible.role, updatedAt: responsible.updatedAt })
        .where(and(eq(projectResponsibles.projectId, project.id), eq(projectResponsibles.userId, userId)))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async removeResponsible(project: Project, userId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(projectResponsibles)
        .where(and(eq(projectResponsibles.projectId, project.id), eq(projectResponsibles.userId, userId)))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }
}
