import { usePostEnrichments } from '@shared/api/hooks/usePostEnrichments'

export function useEnrichContact() {
  const mutation = usePostEnrichments()

  async function enrichContact(contactId: string, templateId: string): Promise<string[]> {
    const result = await mutation.mutateAsync({ data: { contactId, templateId } })
    // POST /enrichments returns { insightIds, count } — not the insight itself.
    // Caller must poll each id with useInsightStatus / useGetEnrichmentsId.
    return result.insightIds
  }

  return {
    enrichContact,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
