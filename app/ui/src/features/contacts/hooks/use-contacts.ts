import { useGetContacts } from '@shared/api/hooks/useGetContacts'
import type { GetContactsQueryParams } from '@shared/api/types/GetContacts'
import { buildFilterParam, type FilterGroups } from '@shared/lib/filter'

const PAGE_SIZE = 20

type Params = {
  page: number
  search?: string
  filterGroups?: FilterGroups
  sortField?: string
  sortDir?: 'asc' | 'desc'
}

export function useContacts({ page, search, filterGroups, sortField, sortDir }: Params) {
  const offset = (page - 1) * PAGE_SIZE
  const filter = buildFilterParam(filterGroups) as GetContactsQueryParams['filter']
  const sort = sortField && sortDir ? `${sortField}:${sortDir}` : undefined

  const params: GetContactsQueryParams = {
    pagination: { limit: PAGE_SIZE, offset },
    ...(search ? { search } : {}),
    ...(filter ? { filter } : {}),
    ...(sort ? { sort } : {}),
  }

  const { data, isLoading, isError, error } = useGetContacts(params)

  return {
    rows: data?.items ?? [],
    total: data?.total ?? 0,
    pageSize: PAGE_SIZE,
    isLoading,
    isError,
    error,
  }
}
