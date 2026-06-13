import type { Context } from 'hono'
import type { ProjectUploadDocumentUseCase } from '@modules/projects/application/use-cases/document/project-upload-document.use-case'
import type { ProjectGetDocumentDownloadUrlUseCase } from '@modules/projects/application/use-cases/document/project-get-document-download-url.use-case'
import type { ProjectDeleteDocumentUseCase } from '@modules/projects/application/use-cases/document/project-delete-document.use-case'
import type { ProjectListDocumentsUseCase } from '@modules/projects/application/use-cases/document/project-list-documents.use-case'
import type { ListQuery } from '@shared/types/filters'
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from '@modules/projects/domain/constants'
import { ValidationError } from '@shared/errors'
import { toDocumentView } from './view-mappers'

export interface ProjectDocumentUseCases {
  uploadDocument: ProjectUploadDocumentUseCase
  getDocumentDownloadUrl: ProjectGetDocumentDownloadUrlUseCase
  deleteDocument: ProjectDeleteDocumentUseCase
  listDocuments: ProjectListDocumentsUseCase
}

export class ProjectDocumentController {
  constructor(private readonly ucs: ProjectDocumentUseCases) {}

  async uploadDocument(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const uploadedBy = c.get('userId') as string

    const body = await c.req.parseBody()
    const file = body['file']

    if (!(file instanceof File)) {
      throw new ValidationError('Missing or invalid file field', [
        { field: 'file', message: 'expected a file upload in the "file" field' },
      ])
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError('File size is invalid', [
        { field: 'file', message: `size must be between 1 and ${MAX_FILE_SIZE_BYTES} bytes` },
      ])
    }

    const allowedTypes: readonly string[] = ALLOWED_MIME_TYPES
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError('File type is not allowed', [
        { field: 'file', message: `allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` },
      ])
    }

    const document = await this.ucs.uploadDocument.execute({
      projectId,
      fileName: file.name,
      contentType: file.type,
      size: file.size,
      body: file,
      uploadedBy,
    })

    return c.json(toDocumentView(document), 201)
  }

  async listDocuments(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as ListQuery

    const page = await this.ucs.listDocuments.execute({ projectId, query })

    return c.json(
      {
        items: page.items.map(toDocumentView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }

  async getDocumentDownloadUrl(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const documentId = c.req.param('docId') as string

    const result = await this.ucs.getDocumentDownloadUrl.execute({ projectId, documentId })

    return c.json({ url: result.url, expiresAt: result.expiresAt.toISOString() }, 200)
  }

  async deleteDocument(c: Context): Promise<Response> {
    const projectId = c.req.param('id') as string
    const documentId = c.req.param('docId') as string

    await this.ucs.deleteDocument.execute({ projectId, documentId })

    return c.body(null, 204)
  }
}
