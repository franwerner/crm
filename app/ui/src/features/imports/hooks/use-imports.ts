import { useGetImports } from '@shared/api/hooks/useGetImports'
import type { ImportListItem } from '@shared/api/types'

export type { ImportListItem }

interface UseImportsParams {
  limit?: number
  offset?: number
}

export function useImports(params: UseImportsParams = {}) {
  const query = useGetImports({
    limit: params.limit ?? 20,
    offset: params.offset ?? 0,
  })

  return {
    imports: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
