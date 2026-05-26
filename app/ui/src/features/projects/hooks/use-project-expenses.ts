import { useGetProjectsIdExpenses } from '@shared/api/hooks/useGetProjectsIdExpenses'
import type { GetProjectsIdExpensesQueryParams } from '@shared/api/types/GetProjectsIdExpenses'

const PAGE_SIZE = 10

export function useProjectExpenses(id: string, page: number) {
  const offset = (page - 1) * PAGE_SIZE

  const params: GetProjectsIdExpensesQueryParams = {
    pagination: { limit: PAGE_SIZE, offset },
    sort: 'incurredAt:desc',
  }

  const { data, isLoading } = useGetProjectsIdExpenses(id, params)

  return {
    expenses: data?.items ?? [],
    total: data?.total ?? 0,
    pageSize: PAGE_SIZE,
    isLoading,
  }
}
