import { useGetProjectsIdDocuments } from '@shared/api/hooks/useGetProjectsIdDocuments'
import type { GetProjectsIdDocumentsQueryParams } from '@shared/api/types/GetProjectsIdDocuments'

const PAGE_SIZE = 10

export function useProjectDocuments(id: string, page: number) {
  const offset = (page - 1) * PAGE_SIZE

  const params: GetProjectsIdDocumentsQueryParams = {
    pagination: { limit: PAGE_SIZE, offset },
    sort: 'uploadedAt:desc',
  }

  const { data, isLoading } = useGetProjectsIdDocuments(id, params)

  return {
    documents: data?.items ?? [],
    total: data?.total ?? 0,
    pageSize: PAGE_SIZE,
    isLoading,
  }
}
