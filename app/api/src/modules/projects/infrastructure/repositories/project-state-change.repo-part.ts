import { asc, desc, eq, sql, type AnyColumn } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { projectStateChanges } from '@shared/db/schema'
import type { ProjectStateChange } from '@modules/projects/domain/entities/project-state-change'
import type { ProjectStatus } from '@modules/projects/domain/types/project-status'
import type { StateChangeCause } from '@modules/projects/domain/types/state-change-cause'
import type { Page } from '@shared/types/pagination'
import type { ListQuery } from '@shared/types/filters'
import { applyFilterGroups, combineWhere } from '@shared/db/drizzle-filters'
import { stateChangeColumnMap } from '@modules/projects/infrastructure/project.resource'

type ProjectStateChangeRow = typeof projectStateChanges.$inferSelect

export function toStateChangeCause(row: ProjectStateChangeRow): StateChangeCause {
  if (row.causeKind === 'manual') {
    return { kind: 'manual', userId: row.causedByUserId ?? '', note: row.causeReason ?? undefined }
  }
  return { kind: 'system', reason: row.causeReason ?? '' }
}

export function toProjectStateChange(row: ProjectStateChangeRow): ProjectStateChange {
  return {
    id: row.id,
    projectId: row.projectId,
    previousState: row.previousState as ProjectStatus,
    nextState: row.nextState as ProjectStatus,
    cause: toStateChangeCause(row),
    changedAt: row.changedAt,
    createdAt: row.createdAt,
  }
}

export function toStateChangeRow(sc: ProjectStateChange): typeof projectStateChanges.$inferInsert {
  return {
    id: sc.id,
    projectId: sc.projectId,
    previousState: sc.previousState,
    nextState: sc.nextState,
    causeKind: sc.cause.kind,
    causedByUserId: sc.cause.kind === 'manual' ? sc.cause.userId : null,
    causeReason: sc.cause.kind === 'system' ? sc.cause.reason : sc.cause.note ?? null,
    changedAt: sc.changedAt,
    createdAt: sc.createdAt,
  }
}

export class ProjectStateChangeRepoPart {
  constructor(private readonly db: Db) {}

  async findStateChanges(projectId: string, params: ListQuery): Promise<Page<ProjectStateChange>> {
    const projectGuard = eq(projectStateChanges.projectId, projectId)
    const filterClause = applyFilterGroups(stateChangeColumnMap, params.filterGroups)
    const where = combineWhere([projectGuard, filterClause])

    const sortableMap = stateChangeColumnMap as Record<string, AnyColumn>
    const sortCol = params.sort ? sortableMap[params.sort.field] : undefined
    const orderExpr = sortCol
      ? params.sort!.dir === 'asc'
        ? asc(sortCol)
        : desc(sortCol)
      : desc(projectStateChanges.changedAt)

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ count: sql<string>`count(*)` })
        .from(projectStateChanges)
        .where(where),
      this.db
        .select()
        .from(projectStateChanges)
        .where(where)
        .orderBy(orderExpr)
        .limit(params.pagination.limit)
        .offset(params.pagination.offset),
    ])

    const total = Number(countResult[0]?.count ?? 0)
    const items = rows.map(toProjectStateChange)

    return { items, total, limit: params.pagination.limit, offset: params.pagination.offset }
  }
}
