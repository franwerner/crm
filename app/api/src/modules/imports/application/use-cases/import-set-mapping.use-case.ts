import { NotFoundError } from '@shared/errors'
import type { ImportsRepository } from '@modules/imports/domain/import.repository'
import type { QueueProducer } from '@shared/queue'
import { validateMapping } from '@modules/imports/domain/policies'

export interface SetMappingInput {
  importId: string
  mapping: Record<string, string>
  templateId?: string | null
}

export interface SetMappingOutput {
  importId: string
  status: string
}

export class ImportSetMappingUseCase {
  constructor(
    private readonly repo: ImportsRepository,
    private readonly queue: QueueProducer,
  ) {}

  async execute(input: SetMappingInput): Promise<SetMappingOutput> {
    const importRecord = await this.repo.findById(input.importId)
    if (!importRecord) {
      throw new NotFoundError(`Import ${input.importId} not found`)
    }

    const validation = validateMapping(
      importRecord.columnHeaders as string[],
      input.mapping,
    )
    if (!validation.ok) {
      throw validation.error
    }

    const now = new Date()
    const updated = importRecord.setMapping(input.mapping, now)

    await this.repo.save(updated)

    // Enqueue exactly one job keyed by importId so double-calls are idempotent (D9).
    await this.queue.enqueue('import', 'process-import', { importId: input.importId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    })

    return { importId: updated.id, status: updated.status }
  }
}
