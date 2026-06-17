import { ValidationError } from '@shared/errors'
import type { ImportStatus } from '@modules/imports/domain/types/import-status'
import type { ImportStage } from '@modules/imports/domain/types/import-stage'

// Valid status transitions — an import can only move forward along this path.
const ALLOWED_TRANSITIONS: Partial<Record<ImportStatus, readonly ImportStatus[]>> = {
  awaiting_mapping: ['pending'],
  pending: ['processing'],
  processing: ['completed', 'failed'],
}

export interface ImportProps {
  readonly id: string
  readonly filename: string
  readonly fileKey: string
  readonly status: ImportStatus
  readonly stage: ImportStage | null
  readonly columnHeaders: readonly string[]
  readonly mapping: Record<string, string> | null
  readonly templateId: string | null
  readonly totalRows: number | null
  readonly processedRows: number
  // The actual Excel row.number of the last committed row (blank-safe resume anchor per D7).
  readonly lastRowNumber: number
  readonly okCount: number
  readonly failedCount: number
  readonly duplicatedCount: number
  readonly rejectedCsvKey: string | null
  readonly createdBy: string
  readonly startedAt: Date | null
  // Fase 2 opt-in: enqueue enrichment after import completes (D5)
  readonly analyzeOnComplete: boolean
  readonly enrichmentTemplateId: string | null
  readonly createdAt: Date
  readonly updatedAt: Date
}

export class Import {
  private readonly props: ImportProps

  private constructor(props: ImportProps) {
    this.props = props
  }

  static create(params: {
    id: string
    filename: string
    fileKey: string
    columnHeaders: readonly string[]
    createdBy: string
    createdAt: Date
    updatedAt: Date
    templateId?: string | null
  }): Import {
    if (!params.id.trim()) {
      throw new ValidationError('Import id cannot be empty', [{ field: 'id', message: 'id is required' }])
    }
    if (!params.createdBy.trim()) {
      throw new ValidationError('createdBy cannot be empty', [{ field: 'createdBy', message: 'createdBy is required' }])
    }
    if (!params.filename.trim()) {
      throw new ValidationError('filename cannot be empty', [{ field: 'filename', message: 'filename is required' }])
    }
    if (!params.fileKey.trim()) {
      throw new ValidationError('fileKey cannot be empty', [{ field: 'fileKey', message: 'fileKey is required' }])
    }

    const props: ImportProps = {
      id: params.id,
      filename: params.filename,
      fileKey: params.fileKey,
      status: 'awaiting_mapping',
      stage: null,
      columnHeaders: params.columnHeaders,
      mapping: null,
      templateId: params.templateId ?? null,
      totalRows: null,
      processedRows: 0,
      lastRowNumber: 0,
      okCount: 0,
      failedCount: 0,
      duplicatedCount: 0,
      rejectedCsvKey: null,
      createdBy: params.createdBy,
      startedAt: null,
      analyzeOnComplete: false,
      enrichmentTemplateId: null,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    }

    return new Import(props)
  }

  static reconstitute(props: ImportProps): Import {
    return new Import(props)
  }

  private withProps(patch: Partial<ImportProps>): Import {
    return new Import({ ...this.props, ...patch })
  }

  // Getters
  get id(): string { return this.props.id }
  get filename(): string { return this.props.filename }
  get fileKey(): string { return this.props.fileKey }
  get status(): ImportStatus { return this.props.status }
  get stage(): ImportStage | null { return this.props.stage }
  get columnHeaders(): readonly string[] { return this.props.columnHeaders }
  get mapping(): Record<string, string> | null { return this.props.mapping }
  get templateId(): string | null { return this.props.templateId }
  get totalRows(): number | null { return this.props.totalRows }
  get processedRows(): number { return this.props.processedRows }
  get lastRowNumber(): number { return this.props.lastRowNumber }
  get okCount(): number { return this.props.okCount }
  get failedCount(): number { return this.props.failedCount }
  get duplicatedCount(): number { return this.props.duplicatedCount }
  get rejectedCsvKey(): string | null { return this.props.rejectedCsvKey }
  get createdBy(): string { return this.props.createdBy }
  get startedAt(): Date | null { return this.props.startedAt }
  get analyzeOnComplete(): boolean { return this.props.analyzeOnComplete }
  get enrichmentTemplateId(): string | null { return this.props.enrichmentTemplateId }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }

  setMapping(mapping: Record<string, string>, now: Date): Import {
    this.assertTransition('pending')
    return this.withProps({
      mapping,
      status: 'pending',
      updatedAt: now,
    })
  }

  // Fase 3 (B.9): set enrichment-on-completion options alongside or after mapping.
  // Kept separate so the caller can chain after setMapping without needing to overload it.
  setAnalyzeOptions(params: { analyzeOnComplete: boolean; enrichmentTemplateId: string | null }): Import {
    return this.withProps({
      analyzeOnComplete: params.analyzeOnComplete,
      enrichmentTemplateId: params.enrichmentTemplateId,
    })
  }

  startProcessing(now: Date): Import {
    this.assertTransition('processing')
    return this.withProps({
      status: 'processing',
      stage: 'counting',
      startedAt: this.props.startedAt ?? now,
      updatedAt: now,
    })
  }

  setTotalRows(totalRows: number, now: Date): Import {
    return this.withProps({
      totalRows,
      stage: 'ingesting',
      updatedAt: now,
    })
  }

  saveProgress(params: {
    processedRows: number
    lastRowNumber: number
    okCount: number
    failedCount: number
    duplicatedCount: number
    now: Date
  }): Import {
    return this.withProps({
      processedRows: params.processedRows,
      lastRowNumber: params.lastRowNumber,
      okCount: params.okCount,
      failedCount: params.failedCount,
      duplicatedCount: params.duplicatedCount,
      updatedAt: params.now,
    })
  }

  finalize(params: {
    okCount: number
    failedCount: number
    duplicatedCount: number
    processedRows: number
    rejectedCsvKey: string | null
    now: Date
  }): Import {
    this.assertTransition('completed')
    return this.withProps({
      status: 'completed',
      stage: 'finalizing',
      okCount: params.okCount,
      failedCount: params.failedCount,
      duplicatedCount: params.duplicatedCount,
      processedRows: params.processedRows,
      rejectedCsvKey: params.rejectedCsvKey,
      updatedAt: params.now,
    })
  }

  markFailed(now: Date): Import {
    this.assertTransition('failed')
    return this.withProps({ status: 'failed', updatedAt: now })
  }

  private assertTransition(target: ImportStatus): void {
    const allowed = ALLOWED_TRANSITIONS[this.props.status] ?? []
    if (!allowed.includes(target)) {
      throw new ValidationError(
        `Invalid import status transition: ${this.props.status} → ${target}`,
        [{ field: 'status', message: `Cannot transition from ${this.props.status} to ${target}` }],
      )
    }
  }
}
