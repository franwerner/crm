import { useGetEnrichmentsId } from '@shared/api/hooks/useGetEnrichmentsId'
import type { GetEnrichmentsIdQueryResponse } from '@shared/api/types/GetEnrichmentsId'

// Terminal states for enrichment insights — polling must stop when one of these is reached.
// ADR: frontend/polling-with-refetchinterval — refetchInterval as conditional function.
const TERMINAL_STATUSES = new Set(['completed', 'failed'])

const POLL_INTERVAL_MS = 3000

function isTerminal(data: GetEnrichmentsIdQueryResponse | undefined): boolean {
  if (!data) return false
  return TERMINAL_STATUSES.has(data.status)
}

export function useInsightStatus(insightId: string | undefined) {
  const query = useGetEnrichmentsId(insightId, {
    query: {
      // refetchInterval as a function: stops polling when status reaches a terminal state.
      // An undefined data value (first fetch in flight) keeps polling active.
      refetchInterval: (query) => (isTerminal(query.state.data) ? false : POLL_INTERVAL_MS),
    },
  })

  return {
    insight: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
