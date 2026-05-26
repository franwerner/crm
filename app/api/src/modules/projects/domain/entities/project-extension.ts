export interface ProjectExtension {
  readonly id: string
  readonly projectId: string
  readonly additionalDays: number
  readonly appliedEndDate: Date
  readonly reason: string
  readonly cost: number | null
  readonly billedAmount: number | null
  readonly grantedAt: Date
  readonly grantedBy: string
  readonly createdAt: Date
  readonly updatedAt: Date
}
