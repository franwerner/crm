// Port — no Drizzle/DB import allowed here (EDR adr02-1b-port-contract).
import type { AnalysisTemplate } from '@modules/enrichment/domain/entities/analysis-template'

export interface AnalysisTemplateRepository {
  findById(id: string): Promise<AnalysisTemplate | null>
  findActive(): Promise<AnalysisTemplate[]>
  save(template: AnalysisTemplate): Promise<void>
  list(): Promise<AnalysisTemplate[]>
}
