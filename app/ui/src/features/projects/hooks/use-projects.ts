import { useGetProjects } from '@shared/api/hooks/useGetProjects'
import type { GetProjectsQueryParams } from '@shared/api/types/GetProjects'
import { buildFilterParam, type FilterGroups } from '@shared/lib/utils/filter'

const PAGE_SIZE = 10

type Params = {
  page: number
  search?: string
  filterGroups?: FilterGroups
  sortField?: string
  sortDir?: 'asc' | 'desc'
}

export function useProjects({ page, search, filterGroups, sortField, sortDir }: Params) {
  const offset = (page - 1) * PAGE_SIZE
  const filter = buildFilterParam(filterGroups) as GetProjectsQueryParams['filter']
  const sort = sortField && sortDir ? `${sortField}:${sortDir}` : undefined

  const params: GetProjectsQueryParams = {
    pagination: { limit: PAGE_SIZE, offset },
    ...(search ? { search } : {}),
    ...(filter ? { filter } : {}),
    ...(sort ? { sort } : {}),
  }

  const { data, isLoading, isError, error } = useGetProjects(params)

  return {
    rows: data?.items ?? [],
    total: data?.total ?? 0,
    pageSize: PAGE_SIZE,
    isLoading,
    isError,
    error,
  }
}
