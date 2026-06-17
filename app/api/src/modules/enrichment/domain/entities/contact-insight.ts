import { BusinessRuleError } from '@shared/errors'
import type { InsightStatus } from '@modules/enrichment/domain/types/insight-status'
import type { TriggerKind } from '@modules/enrichment/domain/types/trigger-kind'

export interface InsightResult {
  resumen: string
  recomendaciones: string[]
  observaciones: string
}

export interface InsightTracking {
  modelUsed: string
  promptTokens: number
  completionTokens: number
  costUsd?: string
}

export interface ContactInsightProps {
  readonly id: string
  readonly contactId: string
  readonly templateId: string
  readonly templateVersion: number
  readonly triggerKind: TriggerKind
  readonly status: InsightStatus
  readonly attempts: number
  readonly result: InsightResult | null
  readonly modelUsed: string | null
  readonly promptTokens: number | null
  readonly completionTokens: number | null
  readonly costUsd: string | null
  readonly lastError: string | null
  readonly completedAt: Date | null
  readonly createdAt: Date
  readonly updatedAt: Date
}

export class ContactInsight {
  private readonly props: ContactInsightProps

  private constructor(props: ContactInsightProps) {
    this.props = props
  }

  static create(params: {
    id: string
    contactId: string
    templateId: string
    templateVersion: number
    triggerKind: TriggerKind
    createdAt: Date
    updatedAt: Date
  }): ContactInsight {
    return new ContactInsight({
      id: params.id,
      contactId: params.contactId,
      templateId: params.templateId,
      templateVersion: params.templateVersion,
      triggerKind: params.triggerKind,
      status: 'queued',
      attempts: 0,
      result: null,
      modelUsed: null,
      promptTokens: null,
      completionTokens: null,
      costUsd: null,
      lastError: null,
      completedAt: null,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    })
  }

  static reconstitute(props: ContactInsightProps): ContactInsight {
    return new ContactInsight(props)
  }

  private withProps(patch: Partial<ContactInsightProps>): ContactInsight {
    return new ContactInsight({ ...this.props, ...patch })
  }

  get id(): string { return this.props.id }
  get contactId(): string { return this.props.contactId }
  get templateId(): string { return this.props.templateId }
  get templateVersion(): number { return this.props.templateVersion }
  get triggerKind(): TriggerKind { return this.props.triggerKind }
  get status(): InsightStatus { return this.props.status }
  get attempts(): number { return this.props.attempts }
  get result(): InsightResult | null { return this.props.result }
  get modelUsed(): string | null { return this.props.modelUsed }
  get promptTokens(): number | null { return this.props.promptTokens }
  get completionTokens(): number | null { return this.props.completionTokens }
  get costUsd(): string | null { return this.props.costUsd }
  get lastError(): string | null { return this.props.lastError }
  get completedAt(): Date | null { return this.props.completedAt }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }

  markProcessing(now: Date): ContactInsight {
    return this.withProps({
      status: 'processing',
      attempts: this.props.attempts + 1,
      updatedAt: now,
    })
  }

  markCompleted(result: InsightResult, tracking: InsightTracking, now: Date): ContactInsight {
    return this.withProps({
      status: 'completed',
      result,
      modelUsed: tracking.modelUsed,
      promptTokens: tracking.promptTokens,
      completionTokens: tracking.completionTokens,
      costUsd: tracking.costUsd ?? null,
      lastError: null,
      completedAt: now,
      updatedAt: now,
    })
  }

  markFailed(lastError: string, now: Date): ContactInsight {
    return this.withProps({
      status: 'failed',
      lastError,
      updatedAt: now,
    })
  }

  // Records the error message from the current attempt without changing the status.
  // Used by the process use-case before rethrowing so BullMQ retries while lastError stays current.
  recordError(message: string, now: Date): ContactInsight {
    return this.withProps({
      lastError: message,
      updatedAt: now,
    })
  }

  resetForRetry(now: Date): ContactInsight {
    if (this.props.status !== 'failed') {
      throw new BusinessRuleError(
        `Cannot retry insight in status '${this.props.status}' — only 'failed' insights can be retried`,
      )
    }
    return this.withProps({
      status: 'queued',
      attempts: 0,
      lastError: null,
      updatedAt: now,
    })
  }
}
