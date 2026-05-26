import { useGetProjectsId } from '@shared/api/hooks/useGetProjectsId'

export function useProject(id: string) {
  const { data, isLoading, isError } = useGetProjectsId(id)

  return {
    project: data ?? null,
    isLoading,
    isError,
  }
}
