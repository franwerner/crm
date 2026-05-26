import { useGetProjectsIdExtensions } from '@shared/api/hooks/useGetProjectsIdExtensions'
import type { GetProjectsIdExtensionsQueryParams } from '@shared/api/types/GetProjectsIdExtensions'

const PAGE_SIZE = 10

export function useProjectExtensions(id: string, page: number) {
  const offset = (page - 1) * PAGE_SIZE

  const params: GetProjectsIdExtensionsQueryParams = {
    pagination: { limit: PAGE_SIZE, offset },
    sort: 'grantedAt:desc',
  }

  const { data, isLoading } = useGetProjectsIdExtensions(id, params)

  return {
    extensions: data?.items ?? [],
    total: data?.total ?? 0,
    pageSize: PAGE_SIZE,
    isLoading,
  }
}
