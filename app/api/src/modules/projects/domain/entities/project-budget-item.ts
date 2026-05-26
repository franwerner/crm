export interface ProjectBudgetItem {
  readonly id: string
  readonly projectId: string
  readonly concept: string
  readonly amountMinor: number
  readonly createdAt: Date
  readonly updatedAt: Date
}
