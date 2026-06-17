import { useGetAnalysisTemplates } from '@shared/api/hooks/useGetAnalysisTemplates'
import type { GetAnalysisTemplates200 } from '@shared/api/types/GetAnalysisTemplates'

// Re-export the template item type for consumers — avoids importing from kubb paths directly
export type AnalysisTemplate = GetAnalysisTemplates200[number]

export function useTemplates() {
  const { data, isLoading, isError, error, refetch } = useGetAnalysisTemplates()

  const templates: AnalysisTemplate[] = data ?? []

  return {
    templates,
    isLoading,
    isError,
    error,
    refetch,
  }
}
