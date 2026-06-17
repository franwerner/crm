import type { ProjectsRepository } from '@modules/projects/domain/project.repository'
import type { ObjectStorage } from '@shared/storage'
import type { Logger } from '@shared/logger'
import { NotFoundError } from '@shared/errors'

export interface DeleteDocumentInput {
  projectId: string
  documentId: string
}

export class ProjectDeleteDocumentUseCase {
  constructor(
    private readonly repo: ProjectsRepository,
    private readonly storage: ObjectStorage,
    private readonly logger: Logger,
  ) {}

  async execute(input: DeleteDocumentInput): Promise<void> {
    const project = await this.repo.findById(input.projectId)
    if (!project) {
      throw new NotFoundError(`Project ${input.projectId} not found`)
    }

    const document = await this.repo.findDocumentById(input.documentId)
    if (!document || document.projectId !== input.projectId) {
      throw new NotFoundError(`Document ${input.documentId} not found on project ${input.projectId}`)
    }

    const updated = project.removeDocument(input.documentId, new Date())
    await this.repo.deleteDocument(updated, input.documentId)

    try {
      await this.storage.deleteObject(document.storageKey)
    } catch (err) {
      this.logger.warn({ storageKey: document.storageKey, err }, '[storage] failed to delete object after DB delete')
    }
  }
}
