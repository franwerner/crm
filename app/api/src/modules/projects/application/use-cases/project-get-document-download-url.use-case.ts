import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { ObjectStorage } from '@shared/storage'
import { NotFoundError } from '@shared/errors'
import { PRESIGNED_DOWNLOAD_TTL_SECONDS } from '@modules/projects/domain/constants'

export interface GetDocumentDownloadUrlInput {
  projectId: string
  documentId: string
}

export interface GetDocumentDownloadUrlResult {
  url: string
  expiresAt: Date
}

export class ProjectGetDocumentDownloadUrlUseCase {
  constructor(
    private readonly repo: ProjectsRepository,
    private readonly storage: ObjectStorage,
  ) {}

  async execute(input: GetDocumentDownloadUrlInput): Promise<GetDocumentDownloadUrlResult> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const document = await this.repo.findDocumentById(input.documentId)
    if (!document || document.projectId !== input.projectId) {
      throw new NotFoundError(`Document ${input.documentId} not found on project ${input.projectId}`)
    }

    const url = await this.storage.getPresignedDownloadUrl(document.storageKey, PRESIGNED_DOWNLOAD_TTL_SECONDS)
    const expiresAt = new Date(Date.now() + PRESIGNED_DOWNLOAD_TTL_SECONDS * 1000)

    return { url, expiresAt }
  }
}
