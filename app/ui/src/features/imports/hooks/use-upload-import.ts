import { useMutation } from '@tanstack/react-query'
import { postImports } from '@shared/api/clients/postImports'
import { toUserMessage } from '@shared/lib/utils/problem'
import type { ImportUploadResponse } from '@shared/api/types/ImportUploadResponse'

// WORKAROUND: kubb generates postImports without a typed body because the endpoint
// accepts multipart/form-data. We pass `config.data = formData` directly, mirroring
// the pattern used in postProjectsIdDocuments. This is fragile if kubb regenerates
// and changes the RequestConfig signature — verify after any gen:api run.
export function useUploadImport() {
  const mutation = useMutation<ImportUploadResponse, unknown, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return postImports({ data: formData } as Parameters<typeof postImports>[0])
    },
  })

  async function uploadImport(file: File): Promise<ImportUploadResponse> {
    return mutation.mutateAsync(file)
  }

  return {
    uploadImport,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}
