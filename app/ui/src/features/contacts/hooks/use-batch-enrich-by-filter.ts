import { usePostEnrichmentsBatch } from '@shared/api/hooks/usePostEnrichmentsBatch'
import type { PostEnrichmentsBatchMutationResponse } from '@shared/api/types'
import type { FilterGroups } from '@shared/lib/utils/filter'

export function useBatchEnrichByFilter() {
  const mutation = usePostEnrichmentsBatch()

  async function batchEnrichByFilter(params: {
    filterGroups: FilterGroups
    search?: string
    templateId: string
  }): Promise<PostEnrichmentsBatchMutationResponse> {
    return mutation.mutateAsync({
      data: {
        kind: 'filter',
        filterGroups: params.filterGroups,
        search: params.search,
        templateId: params.templateId,
      },
    })
  }

  return {
    batchEnrichByFilter,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  }
}
