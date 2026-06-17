import { useGetEnrichments } from '@shared/api/hooks/useGetEnrichments'
import type { InsightOut } from '@shared/api/types/InsightOut'

export type ContactInsightItem = InsightOut

export function useContactInsights(contactId: string) {
  const query = useGetEnrichments(
    { contactId },
    { query: { enabled: Boolean(contactId) } },
  )

  return {
    insights: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
