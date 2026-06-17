// Drizzle adapter — Drizzle ONLY inside this file (ADR data-access.md).
import { eq } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { analysisTemplates } from '@shared/db/schema'
import { AnalysisTemplate } from '@modules/enrichment/domain/entities/analysis-template'
import type { AnalysisTemplateRepository } from '@modules/enrichment/domain/analysis-template.repository'

type TemplateRow = typeof analysisTemplates.$inferSelect

function rowToTemplate(row: TemplateRow): AnalysisTemplate {
  return AnalysisTemplate.reconstitute({
    id: row.id,
    name: row.name,
    rubro: row.rubro,
    prompt: row.prompt,
    modelProvider: row.modelProvider,
    version: row.version,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  })
}

export class DrizzleAnalysisTemplateRepository implements AnalysisTemplateRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<AnalysisTemplate | null> {
    const rows = await this.db
      .select()
      .from(analysisTemplates)
      .where(eq(analysisTemplates.id, id))
      .limit(1)
    const row = rows[0]
    return row ? rowToTemplate(row) : null
  }

  async findActive(): Promise<AnalysisTemplate[]> {
    const rows = await this.db
      .select()
      .from(analysisTemplates)
      .where(eq(analysisTemplates.isActive, true))
    return rows.map(rowToTemplate)
  }

  async save(template: AnalysisTemplate): Promise<void> {
    const row: typeof analysisTemplates.$inferInsert = {
      id: template.id,
      name: template.name,
      rubro: template.rubro,
      prompt: template.prompt,
      modelProvider: template.modelProvider,
      version: template.version,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      deletedAt: template.deletedAt,
    }
    await this.db
      .insert(analysisTemplates)
      .values(row)
      .onConflictDoUpdate({
        target: analysisTemplates.id,
        set: {
          name: row.name,
          rubro: row.rubro,
          prompt: row.prompt,
          modelProvider: row.modelProvider,
          version: row.version,
          isActive: row.isActive,
          updatedAt: row.updatedAt,
          deletedAt: row.deletedAt,
        },
      })
  }

  async list(): Promise<AnalysisTemplate[]> {
    const rows = await this.db.select().from(analysisTemplates)
    return rows.map(rowToTemplate)
  }
}
