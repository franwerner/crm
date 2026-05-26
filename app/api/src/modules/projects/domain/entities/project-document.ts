export interface ProjectDocument {
  readonly id: string
  readonly projectId: string
  readonly fileName: string
  readonly contentType: string
  readonly sizeBytes: number
  readonly storageKey: string
  readonly uploadedBy: string
  readonly uploadedAt: Date
  readonly createdAt: Date
  readonly updatedAt: Date
}
