import { toast } from 'sonner'
import { usePostAnalysisTemplates } from '@shared/api/hooks/usePostAnalysisTemplates'
import { usePatchAnalysisTemplatesId } from '@shared/api/hooks/usePatchAnalysisTemplatesId'
import { useDeleteAnalysisTemplatesId } from '@shared/api/hooks/useDeleteAnalysisTemplatesId'
import { queryClient } from '@shared/lib/config/query-client'
import { toUserMessage } from '@shared/lib/utils/problem'
import { getAnalysisTemplatesQueryKey } from '@shared/api/hooks/useGetAnalysisTemplates'
import type { PostAnalysisTemplatesMutationRequest } from '@shared/api/types/PostAnalysisTemplates'
import type { PatchAnalysisTemplatesIdMutationRequest } from '@shared/api/types/PatchAnalysisTemplatesId'

export function useCreateTemplate() {
  const mutation = usePostAnalysisTemplates()

  async function create(data: PostAnalysisTemplatesMutationRequest) {
    await mutation.mutateAsync({ data })
    await queryClient.invalidateQueries({ queryKey: getAnalysisTemplatesQueryKey() })
    toast.success('Template creado')
  }

  return {
    create,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}

export function useUpdateTemplate() {
  const mutation = usePatchAnalysisTemplatesId()

  async function update(id: string, data: PatchAnalysisTemplatesIdMutationRequest) {
    await mutation.mutateAsync({ id, data })
    await queryClient.invalidateQueries({ queryKey: getAnalysisTemplatesQueryKey() })
    toast.success('Template actualizado')
  }

  return {
    update,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}

export function useDeactivateTemplate() {
  const mutation = useDeleteAnalysisTemplatesId()

  async function deactivate(id: string) {
    await mutation.mutateAsync({ id })
    await queryClient.invalidateQueries({ queryKey: getAnalysisTemplatesQueryKey() })
    toast.success('Template desactivado')
  }

  return {
    deactivate,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}
