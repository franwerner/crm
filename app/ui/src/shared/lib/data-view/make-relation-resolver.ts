import { queryClient } from '@shared/lib/config/query-client'
import type { Option } from '@shared/lib/types/option'
import type { RelationResolver } from '@shared/lib/utils/filter'

type RelationSource<TParams, TData, TItem> = {
  queryKey: (params: TParams) => readonly unknown[]
  query: (params: TParams) => Promise<TData>
  getItems: (data: TData) => TItem[]
  toOption: (item: TItem) => Option
  searchParams: (query: string) => TParams
  resolveParams: (ids: string[]) => TParams
}

export const SEARCH_LIMIT = 20

export function makeRelationResolver<TParams, TData, TItem>(
  source: RelationSource<TParams, TData, TItem>,
): RelationResolver {
  const fetchOptions = async (params: TParams): Promise<Option[]> => {
    const data = await queryClient.fetchQuery({
      queryKey: source.queryKey(params),
      queryFn: () => source.query(params),
    })
    return source.getItems(data).map(source.toOption)
  }

  return {
    search: (query) => fetchOptions(source.searchParams(query)),
    resolve: (ids) =>
      ids.length === 0 ? Promise.resolve([]) : fetchOptions(source.resolveParams(ids)),
  }
}
