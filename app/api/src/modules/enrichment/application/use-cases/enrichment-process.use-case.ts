import { z } from 'zod'
import type { ContactInsightRepository } from '@modules/enrichment/domain/contact-insight.repository'
import type { AnalysisTemplateRepository } from '@modules/enrichment/domain/analysis-template.repository'
import type { LLMProvider } from '@modules/enrichment/domain/llm-provider'
import type { ContactReadQuery } from '@modules/enrichment/application/ports'
import { NotFoundError } from '@shared/errors'
import { config } from '@shared/config'

// The fixed output shape validated on every LLM response
const InsightOutputSchema = z.object({
  resumen: z.string().min(1),
  recomendaciones: z.array(z.string()),
  observaciones: z.string(),
})

export interface ProcessInput {
  insightId: string
}

export class EnrichmentProcessUseCase {
  constructor(
    private readonly insightRepo: ContactInsightRepository,
    private readonly templateRepo: AnalysisTemplateRepository,
    private readonly contactReadQuery: ContactReadQuery,
    private readonly llmProvider: LLMProvider,
  ) {}

  async execute(input: ProcessInput): Promise<void> {
    const insight = await this.insightRepo.findById(input.insightId)
    if (!insight) throw new NotFoundError(`Insight '${input.insightId}' not found`)

    // Idempotency: already terminal — no-op
    if (insight.status === 'completed') return

    const now = new Date()
    const processing = insight.markProcessing(now)
    await this.insightRepo.save(processing)

    const contact = await this.contactReadQuery.findById(processing.contactId)
    if (!contact) {
      const failed = processing.markFailed(`Contact '${processing.contactId}' not found`, new Date())
      await this.insightRepo.save(failed)
      return
    }

    const template = await this.templateRepo.findById(processing.templateId)
    if (!template) {
      const failed = processing.markFailed(`Template '${processing.templateId}' not found`, new Date())
      await this.insightRepo.save(failed)
      return
    }

    const systemPrompt = this.buildSystemPrompt(template.prompt)
    const userContent = this.buildUserContent(contact)

    // Model rotation/fallback is the gateway's responsibility (EDR runtime/llm-resilience.md).
    // The CRM passes the configured gateway slug and lets the provider resolve internally.
    let completion
    try {
      completion = await this.llmProvider.complete({
        systemPrompt,
        userContent,
        model: config.openrouterModel,
      })
    } catch (err) {
      // Persist the real error message so each retry leaves a traceable lastError in the DB.
      const message = err instanceof Error ? err.message : String(err)
      const withError = processing.recordError(message, new Date())
      await this.insightRepo.save(withError)
      // Rethrow — BullMQ will retry with exponential backoff.
      throw err
    }

    // Free models often wrap the JSON in markdown fences or prose, so extract it first.
    // If it still doesn't parse, record and rethrow: BullMQ retries and the auto-router
    // may route the next attempt to a model that returns clean JSON.
    let parsed: z.infer<typeof InsightOutputSchema>
    try {
      const raw = JSON.parse(extractJsonObject(completion.content)) as unknown
      parsed = InsightOutputSchema.parse(raw)
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : String(parseErr)
      const withError = processing.recordError(`Invalid LLM output: ${msg}`, new Date())
      await this.insightRepo.save(withError)
      throw parseErr
    }

    const completed = processing.markCompleted(
      parsed,
      {
        modelUsed: completion.modelUsed,
        promptTokens: completion.promptTokens,
        completionTokens: completion.completionTokens,
      },
      new Date(),
    )
    await this.insightRepo.save(completed)
  }

  private buildSystemPrompt(templatePrompt: string): string {
    return (
      templatePrompt +
      '\n\nRespond ONLY with valid JSON matching exactly this shape:\n' +
      '{"resumen": "<string>", "recomendaciones": ["<string>", ...], "observaciones": "<string>"}\n' +
      'Do not include any text outside the JSON object.'
    )
  }

  private buildUserContent(contact: Awaited<ReturnType<ContactReadQuery['findById']>> & object): string {
    const lines: string[] = [`Contact name: ${contact.name}`]
    if (contact.notes) lines.push(`Notes: ${contact.notes}`)
    if (contact.addressCity) lines.push(`City: ${contact.addressCity}`)
    if (contact.addressCountry) lines.push(`Country: ${contact.addressCountry}`)
    if (contact.channels.length > 0) {
      lines.push(
        'Channels: ' +
          contact.channels
            .map((ch) => `${ch.channelType}:${ch.value}${ch.isPrimary ? ' (primary)' : ''}`)
            .join(', '),
      )
    }
    return lines.join('\n')
  }
}

// Recovers the JSON object from a "dirty" LLM response: strips markdown fences and
// trims surrounding prose by slicing from the first '{' to the last '}'.
function extractJsonObject(content: string): string {
  const trimmed = content.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const candidate = fenced?.[1]?.trim() ?? trimmed
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  return start !== -1 && end > start ? candidate.slice(start, end + 1) : candidate
}
