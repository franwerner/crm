import { toast } from 'sonner'
import { usePostProjectsIdResponsibles } from '@shared/api/hooks/usePostProjectsIdResponsibles'
import { usePatchProjectsIdResponsiblesUserid } from '@shared/api/hooks/usePatchProjectsIdResponsiblesUserid'
import { useDeleteProjectsIdResponsiblesUserid } from '@shared/api/hooks/useDeleteProjectsIdResponsiblesUserid'
import { getProjectsIdQueryKey } from '@shared/api/hooks/useGetProjectsId'
import { queryClient } from '@shared/lib/config/query-client'
import { toUserMessage } from '@shared/lib/utils/problem'
import type { ResponsibleCreateFormValues } from '@features/projects/constants/project-responsible.form'
import type { ResponsibleEditFormValues } from '@features/projects/constants/project-responsible-edit.form'

export function useAddResponsible(projectId: string) {
  const mutation = usePostProjectsIdResponsibles()

  async function addResponsible(data: ResponsibleCreateFormValues) {
    await mutation.mutateAsync({ id: projectId, data })
    await queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) })
    toast.success('Responsable asignado')
  }

  return {
    addResponsible,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}

export function useUpdateResponsible(projectId: string) {
  const mutation = usePatchProjectsIdResponsiblesUserid()

  async function updateResponsible(userId: string, data: ResponsibleEditFormValues) {
    await mutation.mutateAsync({ id: projectId, userId, data })
    await queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) })
    toast.success('Rol actualizado')
  }

  return {
    updateResponsible,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}

export function useRemoveResponsible(projectId: string) {
  const mutation = useDeleteProjectsIdResponsiblesUserid()

  async function removeResponsible(userId: string) {
    await mutation.mutateAsync({ id: projectId, userId })
    await queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) })
    toast.success('Responsable eliminado')
  }

  return {
    removeResponsible,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}
