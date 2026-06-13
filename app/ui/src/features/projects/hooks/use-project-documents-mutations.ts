import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { postProjectsIdDocuments } from '@shared/api/clients/postProjectsIdDocuments'
import { useDeleteProjectsIdDocumentsDocid } from '@shared/api/hooks/useDeleteProjectsIdDocumentsDocid'
import { getProjectsIdDocumentsQueryKey } from '@shared/api/hooks/useGetProjectsIdDocuments'
import { getProjectsIdQueryKey } from '@shared/api/hooks/useGetProjectsId'
import { queryClient } from '@shared/lib/config/query-client'
import { toUserMessage } from '@shared/lib/utils/problem'

export function useUploadDocuments(projectId: string) {
  const mutation = useMutation({
    mutationFn: async (files: File[]) => {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        await postProjectsIdDocuments(projectId, { data: formData })
      }
    },
  })

  async function uploadDocuments(files: File[]) {
    await mutation.mutateAsync(files)
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getProjectsIdDocumentsQueryKey(projectId) }),
      queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) }),
    ])
    toast.success(files.length > 1 ? 'Documentos subidos' : 'Documento subido')
  }

  return {
    uploadDocuments,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}

export function useRemoveDocument(projectId: string) {
  const mutation = useDeleteProjectsIdDocumentsDocid()

  async function removeDocument(docId: string) {
    await mutation.mutateAsync({ id: projectId, docId })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getProjectsIdDocumentsQueryKey(projectId) }),
      queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) }),
    ])
    toast.success('Documento eliminado')
  }

  return {
    removeDocument,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}
