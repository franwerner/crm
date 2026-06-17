import { useGetEnrichments } from '@shared/api/hooks/useGetEnrichments'
import type { GetEnrichmentsId200 } from '@shared/api/types/GetEnrichmentsId'

// The list endpoint returns the same object shape as the single-insight endpoint.
// GetEnrichmentsQueryResponse is incorrectly typed by kubb (enum key array instead of
// object array), so we cast to the correct item type from GetEnrichmentsId200.
export type ContactInsightItem = GetEnrichmentsId200

export function useContactInsights(contactId: string) {
  const query = useGetEnrichments(
    { contactId },
    { query: { enabled: Boolean(contactId) } },
  )

  return {
    insights: (query.data ?? []) as unknown as ContactInsightItem[],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
