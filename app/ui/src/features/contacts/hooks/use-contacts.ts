import { useGetContacts } from '@shared/api/hooks/useGetContacts'
import type { GetContactsQueryParams } from '@shared/api/types/GetContacts'
import { buildFilterParam } from '@shared/lib/utils/filter'
import type { ListQueryParams } from '@shared/lib/types/list-query-params'

const PAGE_SIZE = 15

export function useContacts({ page, search, filterGroups, sortField, sortDir }: ListQueryParams) {
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
