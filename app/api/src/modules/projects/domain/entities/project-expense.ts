export interface ProjectExpense {
  readonly id: string
  readonly projectId: string
  readonly concept: string
  readonly amountMinor: number
  readonly incurredAt: Date
  readonly createdAt: Date
  readonly updatedAt: Date
}
