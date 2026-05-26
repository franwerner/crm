import { useGetProjectsIdStateChanges } from '@shared/api/hooks/useGetProjectsIdStateChanges'

export function useProjectStateChanges(id: string) {
  const { data, isLoading } = useGetProjectsIdStateChanges(id)

  return {
    stateChanges: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
  }
}
