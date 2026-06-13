import type { ProjectDocument } from '@modules/projects/domain/entities/project-document'
import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { ObjectStorage } from '@shared/storage'
import { NotFoundError, ValidationError } from '@shared/errors'
import { newId } from '@shared/utils/id'
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from '@modules/projects/domain/constants'
import { buildDocumentStorageKey } from '@modules/projects/application/document-storage-key'

export interface UploadDocumentInput {
  projectId: string
  fileName: string
  contentType: string
  size: number
  body: Blob
  uploadedBy: string
}

export class ProjectUploadDocumentUseCase {
  constructor(
    private readonly repo: ProjectsRepository,
    private readonly storage: ObjectStorage,
  ) {}

  async execute(input: UploadDocumentInput): Promise<ProjectDocument> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    if (input.size <= 0 || input.size > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError('File size is invalid', [
        { field: 'file', message: `size must be between 1 and ${MAX_FILE_SIZE_BYTES} bytes` },
      ])
    }

    const allowedTypes: readonly string[] = ALLOWED_MIME_TYPES
    if (!allowedTypes.includes(input.contentType)) {
      throw new ValidationError('File type is not allowed', [
        { field: 'file', message: `allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` },
      ])
    }

    const documentId = newId()
    const { key: storageKey, sanitizedFileName } = buildDocumentStorageKey(input.projectId, documentId, input.fileName)
    const now = new Date()

    await this.storage.putObject(storageKey, input.body, input.contentType)

    const document: ProjectDocument = {
      id: documentId,
      projectId: input.projectId,
      fileName: sanitizedFileName,
      contentType: input.contentType,
      sizeBytes: input.size,
      storageKey,
      uploadedBy: input.uploadedBy,
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
    }

    try {
      const updated = project.addDocument(document)
      await this.repo.addDocument(updated, document)
    } catch (err) {
      try {
        await this.storage.deleteObject(storageKey)
      } catch (cleanupErr) {
        console.warn(`[storage] orphan cleanup failed for key ${storageKey}:`, cleanupErr)
      }
      throw err
    }

    return document
  }
}
