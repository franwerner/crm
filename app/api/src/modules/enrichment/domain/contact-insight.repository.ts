// Port — no Drizzle/DB import allowed here (ADR adr02-1b-port-contract).
import type { ContactInsight } from '@modules/enrichment/domain/entities/contact-insight'

export interface ContactInsightRepository {
  findById(id: string): Promise<ContactInsight | null>
  save(insight: ContactInsight): Promise<void>
  findStale(olderThanMs: number): Promise<ContactInsight[]>
  findByContactAndTemplate(contactId: string, templateId: string): Promise<ContactInsight | null>
}
