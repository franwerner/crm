import { toast } from 'sonner'
import { usePostProjectsIdExpenses } from '@shared/api/hooks/usePostProjectsIdExpenses'
import { usePatchProjectsIdExpensesExpenseid } from '@shared/api/hooks/usePatchProjectsIdExpensesExpenseid'
import { useDeleteProjectsIdExpensesExpenseid } from '@shared/api/hooks/useDeleteProjectsIdExpensesExpenseid'
import { getProjectsIdQueryKey } from '@shared/api/hooks/useGetProjectsId'
import { getProjectsIdExpensesQueryKey } from '@shared/api/hooks/useGetProjectsIdExpenses'
import { queryClient } from '@shared/lib/config/query-client'
import { toUserMessage } from '@shared/lib/utils/problem'
import type { ExpenseCreateFormValues } from '@features/projects/constants/project-expense.form'
import type { ExpenseEditFormValues } from '@features/projects/constants/project-expense-edit.form'

export function useAddExpense(projectId: string) {
  const mutation = usePostProjectsIdExpenses()

  async function addExpense(data: ExpenseCreateFormValues) {
    await mutation.mutateAsync({ id: projectId, data })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getProjectsIdExpensesQueryKey(projectId) }),
      queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) }),
    ])
    toast.success('Gasto registrado')
  }

  return {
    addExpense,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}

export function useUpdateExpense(projectId: string) {
  const mutation = usePatchProjectsIdExpensesExpenseid()

  async function updateExpense(expenseId: string, data: ExpenseEditFormValues) {
    await mutation.mutateAsync({ id: projectId, expenseId, data })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getProjectsIdExpensesQueryKey(projectId) }),
      queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) }),
    ])
    toast.success('Gasto actualizado')
  }

  return {
    updateExpense,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}

export function useRemoveExpense(projectId: string) {
  const mutation = useDeleteProjectsIdExpensesExpenseid()

  async function removeExpense(expenseId: string) {
    await mutation.mutateAsync({ id: projectId, expenseId })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getProjectsIdExpensesQueryKey(projectId) }),
      queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) }),
    ])
    toast.success('Gasto eliminado')
  }

  return {
    removeExpense,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}
