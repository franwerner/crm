import { asc, desc, eq, sql, type AnyColumn } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { projectDocuments, projects } from '@shared/db/schema'
import type { Project } from '@modules/projects/domain/project'
import type { ProjectDocument } from '@modules/projects/domain/entities/project-document'
import type { Page } from '@shared/types/pagination'
import type { ListQuery } from '@shared/types/filters'
import { applyFilterGroups, combineWhere } from '@shared/db/drizzle-filters'
import { documentColumnMap } from '@modules/projects/infrastructure/project.resource'

type ProjectDocumentRow = typeof projectDocuments.$inferSelect

export function toProjectDocument(row: ProjectDocumentRow): ProjectDocument {
  return {
    id: row.id,
    projectId: row.projectId,
    fileName: row.fileName,
    contentType: row.contentType,
    sizeBytes: row.sizeBytes,
    storageKey: row.storageKey,
    uploadedBy: row.uploadedBy,
    uploadedAt: row.uploadedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export class ProjectDocumentRepoPart {
  constructor(private readonly db: Db) {}

  async addDocument(project: Project, document: ProjectDocument): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(projectDocuments).values({
        id: document.id,
        projectId: document.projectId,
        fileName: document.fileName,
        contentType: document.contentType,
        sizeBytes: document.sizeBytes,
        storageKey: document.storageKey,
        uploadedBy: document.uploadedBy,
        uploadedAt: document.uploadedAt,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      })
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async deleteDocument(project: Project, documentId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(projectDocuments).where(eq(projectDocuments.id, documentId))
      await tx
        .update(projects)
        .set({ updatedAt: project.updatedAt })
        .where(eq(projects.id, project.id))
    })
  }

  async findDocumentById(id: string): Promise<ProjectDocument | null> {
    const row = await this.db.query.projectDocuments.findFirst({
      where: eq(projectDocuments.id, id),
    })
    if (!row) return null
    return toProjectDocument(row)
  }

  async findDocuments(projectId: string, params: ListQuery): Promise<Page<ProjectDocument>> {
    const projectGuard = eq(projectDocuments.projectId, projectId)
    const filterClause = applyFilterGroups(documentColumnMap, params.filterGroups)
    const where = combineWhere([projectGuard, filterClause])

    const sortableMap = documentColumnMap as Record<string, AnyColumn>
    const sortCol = params.sort ? sortableMap[params.sort.field] : undefined
    const orderExpr = sortCol
      ? params.sort!.dir === 'asc'
        ? asc(sortCol)
        : desc(sortCol)
      : desc(projectDocuments.uploadedAt)

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projectDocuments)
        .where(where),
      this.db
        .select()
        .from(projectDocuments)
        .where(where)
        .orderBy(orderExpr)
        .limit(params.pagination.limit)
        .offset(params.pagination.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items = rows.map(toProjectDocument)

    return { items, total, limit: params.pagination.limit, offset: params.pagination.offset }
  }
}
