import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { getStatus } from '../utils/problem'

export type RouterContext = {
  queryClient: QueryClient
}

type RedirectHandler = () => void

let onUnauthorized: RedirectHandler | null = null

export function registerUnauthorizedHandler(handler: RedirectHandler) {
  onUnauthorized = handler
}

function handleError(error: unknown) {
  if (getStatus(error) === 401) {
    onUnauthorized?.()
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
