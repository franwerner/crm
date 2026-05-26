import { toast } from 'sonner'
import { usePostProjectsIdBudgetItems } from '@shared/api/hooks/usePostProjectsIdBudgetItems'
import { usePatchProjectsIdBudgetItemsItemid } from '@shared/api/hooks/usePatchProjectsIdBudgetItemsItemid'
import { useDeleteProjectsIdBudgetItemsItemid } from '@shared/api/hooks/useDeleteProjectsIdBudgetItemsItemid'
import { getProjectsIdQueryKey } from '@shared/api/hooks/useGetProjectsId'
import { getProjectsIdBudgetItemsQueryKey } from '@shared/api/hooks/useGetProjectsIdBudgetItems'
import { queryClient } from '@shared/lib/config/query-client'
import { toUserMessage } from '@shared/lib/utils/problem'
import type { BudgetItemCreateFormValues } from '@features/projects/constants/project-budget-item.form'
import type { BudgetItemEditFormValues } from '@features/projects/constants/project-budget-item-edit.form'

export function useAddBudgetItem(projectId: string) {
  const mutation = usePostProjectsIdBudgetItems()

  async function addBudgetItem(data: BudgetItemCreateFormValues) {
    await mutation.mutateAsync({ id: projectId, data })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getProjectsIdBudgetItemsQueryKey(projectId) }),
      queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) }),
    ])
    toast.success('Ítem de presupuesto agregado')
  }

  return {
    addBudgetItem,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}

export function useUpdateBudgetItem(projectId: string) {
  const mutation = usePatchProjectsIdBudgetItemsItemid()

  async function updateBudgetItem(itemId: string, data: BudgetItemEditFormValues) {
    await mutation.mutateAsync({ id: projectId, itemId, data })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getProjectsIdBudgetItemsQueryKey(projectId) }),
      queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) }),
    ])
    toast.success('Ítem de presupuesto actualizado')
  }

  return {
    updateBudgetItem,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}

export function useRemoveBudgetItem(projectId: string) {
  const mutation = useDeleteProjectsIdBudgetItemsItemid()

  async function removeBudgetItem(itemId: string) {
    await mutation.mutateAsync({ id: projectId, itemId })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getProjectsIdBudgetItemsQueryKey(projectId) }),
      queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) }),
    ])
    toast.success('Ítem eliminado')
  }

  return {
    removeBudgetItem,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}
