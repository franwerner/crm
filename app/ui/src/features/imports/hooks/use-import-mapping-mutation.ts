import { usePatchImportsIdMapping } from '@shared/api/hooks/usePatchImportsIdMapping'
import { toUserMessage } from '@shared/lib/utils/problem'
import type { SetMappingBody } from '@shared/api/types/SetMappingBody'

export function useImportMappingMutation() {
  const mutation = usePatchImportsIdMapping()

  async function setMapping(importId: string, data: SetMappingBody): Promise<void> {
    await mutation.mutateAsync({ id: importId, data })
  }

  return {
    setMapping,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}
