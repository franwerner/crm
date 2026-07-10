import { useGetImportsId } from '@shared/api/hooks/useGetImportsId'
import type { GetImportsIdQueryResponse } from '@shared/api/types/GetImportsId'

// Terminal states for imports — polling must stop when one of these is reached.
// EDR: frontend/polling-with-refetchinterval — refetchInterval as conditional function.
const TERMINAL_STATUSES = new Set(['completed', 'failed'])

const POLL_INTERVAL_MS = 2000

function isTerminal(data: GetImportsIdQueryResponse | undefined): boolean {
  if (!data) return false
  return TERMINAL_STATUSES.has(data.status)
}

export function useImportStatus(importId: string | undefined) {
  const query = useGetImportsId(importId, {
    query: {
      // refetchInterval as a function: stops polling when status reaches a terminal state.
      // An undefined data value (first fetch in flight) keeps polling active.
      refetchInterval: (query) => (isTerminal(query.state.data) ? false : POLL_INTERVAL_MS),
    },
  })

  return {
    importStatus: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
