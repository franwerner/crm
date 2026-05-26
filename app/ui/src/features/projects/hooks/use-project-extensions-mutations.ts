import { toast } from 'sonner'
import { usePostProjectsIdExtensions } from '@shared/api/hooks/usePostProjectsIdExtensions'
import { usePatchProjectsIdExtensionsExtid } from '@shared/api/hooks/usePatchProjectsIdExtensionsExtid'
import { useDeleteProjectsIdExtensionsExtid } from '@shared/api/hooks/useDeleteProjectsIdExtensionsExtid'
import { getProjectsIdQueryKey } from '@shared/api/hooks/useGetProjectsId'
import { getProjectsIdExtensionsQueryKey } from '@shared/api/hooks/useGetProjectsIdExtensions'
import { queryClient } from '@shared/lib/config/query-client'
import { toUserMessage } from '@shared/lib/utils/problem'
import type { ExtensionCreateFormValues } from '@features/projects/constants/project-extension.form'
import type { ExtensionEditFormValues } from '@features/projects/constants/project-extension-edit.form'

export function useAddExtension(projectId: string) {
  const mutation = usePostProjectsIdExtensions()

  async function addExtension(data: ExtensionCreateFormValues) {
    await mutation.mutateAsync({ id: projectId, data })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getProjectsIdExtensionsQueryKey(projectId) }),
      queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) }),
    ])
    toast.success('Extensión agregada')
  }

  return {
    addExtension,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}

export function useUpdateExtension(projectId: string) {
  const mutation = usePatchProjectsIdExtensionsExtid()

  async function updateExtension(extId: string, data: ExtensionEditFormValues) {
    await mutation.mutateAsync({ id: projectId, extId, data })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getProjectsIdExtensionsQueryKey(projectId) }),
      queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) }),
    ])
    toast.success('Extensión actualizada')
  }

  return {
    updateExtension,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}

export function useRemoveExtension(projectId: string) {
  const mutation = useDeleteProjectsIdExtensionsExtid()

  async function removeExtension(extId: string) {
    await mutation.mutateAsync({ id: projectId, extId })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getProjectsIdExtensionsQueryKey(projectId) }),
      queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) }),
    ])
    toast.success('Extensión eliminada')
  }

  return {
    removeExtension,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}
