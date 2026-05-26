import { useGetProjectsIdBudgetItems } from '@shared/api/hooks/useGetProjectsIdBudgetItems'
import type { GetProjectsIdBudgetItemsQueryParams } from '@shared/api/types/GetProjectsIdBudgetItems'

const PAGE_SIZE = 10

export function useProjectBudgetItems(id: string, page: number) {
  const offset = (page - 1) * PAGE_SIZE

  const params: GetProjectsIdBudgetItemsQueryParams = {
    pagination: { limit: PAGE_SIZE, offset },
    sort: 'createdAt:desc',
  }

  const { data, isLoading } = useGetProjectsIdBudgetItems(id, params)

  return {
    budgetItems: data?.items ?? [],
    total: data?.total ?? 0,
    pageSize: PAGE_SIZE,
    isLoading,
  }
}
