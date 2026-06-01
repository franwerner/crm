import type { FilterGroups } from '@shared/lib/utils/filter'

export type ListQueryParams = {
  page: number
  search?: string
  filterGroups?: FilterGroups
  sortField?: string
  sortDir?: 'asc' | 'desc'
}
