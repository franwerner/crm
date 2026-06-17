import { usePostEnrichmentsIdRetry } from '@shared/api/hooks/usePostEnrichmentsIdRetry'

export function useRetryInsight() {
  const mutation = usePostEnrichmentsIdRetry()

  async function retryInsight(insightId: string): Promise<void> {
    await mutation.mutateAsync({ id: insightId })
  }

  return {
    retryInsight,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
