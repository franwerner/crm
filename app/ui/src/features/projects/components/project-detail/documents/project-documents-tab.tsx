import { useState } from 'react'
// eslint-disable-next-line boundaries/element-types
import { useProjectDocuments } from '@features/projects/hooks/use-project-documents'
// eslint-disable-next-line boundaries/element-types
import { useUploadDocuments, useRemoveDocument } from '@features/projects/hooks/use-project-documents-mutations'
import { ProjectDocumentsPanel } from '@features/projects/components/project-detail/documents/project-documents-panel'

type Props = {
  projectId: string
}

export function ProjectDocumentsTab({ projectId }: Props) {
  const [documentsPage, setDocumentsPage] = useState(1)

  const { documents, total: documentsTotal, pageSize: documentsPageSize, isLoading: isLoadingDocuments } = useProjectDocuments(projectId, documentsPage)
  const { uploadDocuments, isPending: isUploadingDocuments, errorMessage: uploadDocumentsError } = useUploadDocuments(projectId)
  const { removeDocument, isPending: isRemovingDocument } = useRemoveDocument(projectId)

  return (
    <ProjectDocumentsPanel
      documents={documents}
      total={documentsTotal}
      page={documentsPage}
      pageSize={documentsPageSize}
      isLoading={isLoadingDocuments}
      onPageChange={setDocumentsPage}
      onUpload={uploadDocuments}
      isUploading={isUploadingDocuments}
      uploadError={uploadDocumentsError}
      onDelete={removeDocument}
      isRemoving={isRemovingDocument}
    />
  )
}
