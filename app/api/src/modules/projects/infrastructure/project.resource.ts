import { getTableColumns } from 'drizzle-orm'
import { projects, projectBudgetItems, projectDocuments, projectExpenses, projectExtensions, projectStateChanges } from '@shared/db/schema'
import { buildListRawSchema, toListQuery } from '@shared/db/list-query-schema'
import { tableColumnsExcept } from '@shared/db/drizzle-filters'
import type { ProjectListInput } from '@modules/projects/application/project.query'
import type { ListQuery } from '@shared/types/filters'

export const projectColumnMap = tableColumnsExcept(projects, ['description', 'deletedAt'])

export const projectSearchCols = [projects.name]

export const projectSortableFields = ['name', 'status', 'startDate', 'plannedEndDate', 'createdAt', 'updatedAt'] as const

const projectRawSchema = buildListRawSchema(projectColumnMap)

export const projectListQuerySchema = projectRawSchema.transform(
  (raw): ProjectListInput => toListQuery(raw, projectSortableFields),
)

export const budgetItemColumnMap = tableColumnsExcept(projectBudgetItems, ['projectId'])

export const budgetItemSortableFields = ['concept', 'amountMinor', 'createdAt'] as const

const budgetItemRawSchema = buildListRawSchema(budgetItemColumnMap)

export const budgetItemListQuerySchema = budgetItemRawSchema.transform(
  (raw): ListQuery => toListQuery(raw, budgetItemSortableFields),
)

export const expenseColumnMap = tableColumnsExcept(projectExpenses, ['projectId'])

export const expenseSortableFields = ['concept', 'amountMinor', 'incurredAt', 'createdAt'] as const

const expenseRawSchema = buildListRawSchema(expenseColumnMap)

export const expenseListQuerySchema = expenseRawSchema.transform(
  (raw): ListQuery => toListQuery(raw, expenseSortableFields),
)

export const extensionColumnMap = tableColumnsExcept(projectExtensions, ['projectId'])

export const extensionSortableFields = ['additionalDays', 'grantedAt', 'appliedEndDate', 'createdAt'] as const

const extensionRawSchema = buildListRawSchema(extensionColumnMap)

export const extensionListQuerySchema = extensionRawSchema.transform(
  (raw): ListQuery => toListQuery(raw, extensionSortableFields),
)

export const documentColumnMap = tableColumnsExcept(projectDocuments, ['projectId', 'storageKey'])

export const documentSortableFields = ['fileName', 'uploadedAt', 'sizeBytes', 'createdAt'] as const

const documentRawSchema = buildListRawSchema(documentColumnMap)

export const documentListQuerySchema = documentRawSchema.transform(
  (raw): ListQuery => toListQuery(raw, documentSortableFields),
)

export const stateChangeColumnMap = tableColumnsExcept(projectStateChanges, ['projectId', 'causeReason'])

export const stateChangeSortableFields = ['changedAt', 'createdAt'] as const

const stateChangeRawSchema = buildListRawSchema(stateChangeColumnMap)

export const stateChangeListQuerySchema = stateChangeRawSchema.transform(
  (raw): ListQuery => toListQuery(raw, stateChangeSortableFields),
)
