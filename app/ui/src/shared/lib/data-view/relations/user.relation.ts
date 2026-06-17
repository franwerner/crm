import { getUsers } from '@shared/api/clients'
import { getUsersQueryKey } from '@shared/api/hooks/useGetUsers'
import type { GetUsersQueryParams } from '@shared/api/types/GetUsers'
import type { RelationResolver } from '@shared/lib/utils/filter'
import { makeRelationResolver, SEARCH_LIMIT } from '../make-relation-resolver'


export function makeUserRelation(excludeIds: readonly string[] = []): RelationResolver {
  return makeRelationResolver({
    queryKey: getUsersQueryKey,
    query: (params: GetUsersQueryParams) => getUsers(params),
    getItems: (data) => data.items,
    toOption: (user) => ({ value: user.id, label: user.name }),
    searchParams: (query) => ({
      search: query || undefined,
      pagination: { limit: SEARCH_LIMIT, offset: 0 },
      ...(excludeIds.length > 0 ? { filter: { id: { nin: [...excludeIds] } } } : {}),
    }),
    resolveParams: (ids) => ({
      filter: { id: { in: ids } },
      pagination: { limit: ids.length, offset: 0 },
    }),
  })
}

export const userRelation = makeUserRelation()
