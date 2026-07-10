// Drizzle adapter — Drizzle ONLY inside this file (EDR data-access.md).
import { and, lt, or, eq, desc } from 'drizzle-orm'
import type { Db } from '@shared/db/client'
import { contactInsights } from '@shared/db/schema'
import { ContactInsight } from '@modules/enrichment/domain/entities/contact-insight'
import type { InsightStatus } from '@modules/enrichment/domain/types/insight-status'
import type { TriggerKind } from '@modules/enrichment/domain/types/trigger-kind'
import type { InsightResult } from '@modules/enrichment/domain/entities/contact-insight'
import type { ContactInsightRepository } from '@modules/enrichment/domain/contact-insight.repository'

type InsightRow = typeof contactInsights.$inferSelect

function rowToInsight(row: InsightRow): ContactInsight {
  return ContactInsight.reconstitute({
    id: row.id,
    contactId: row.contactId,
    templateId: row.templateId,
    templateVersion: row.templateVersion,
    triggerKind: row.triggerKind as TriggerKind,
    status: row.status as InsightStatus,
    attempts: row.attempts,
    result: row.result as InsightResult | null,
    modelUsed: row.modelUsed,
    promptTokens: row.promptTokens,
    completionTokens: row.completionTokens,
    costUsd: row.costUsd,
    lastError: row.lastError,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export class DrizzleContactInsightRepository implements ContactInsightRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<ContactInsight | null> {
    const rows = await this.db
      .select()
      .from(contactInsights)
      .where(eq(contactInsights.id, id))
      .limit(1)
    const row = rows[0]
    return row ? rowToInsight(row) : null
  }

  async save(insight: ContactInsight): Promise<void> {
    const row: typeof contactInsights.$inferInsert = {
      id: insight.id,
      contactId: insight.contactId,
      templateId: insight.templateId,
      templateVersion: insight.templateVersion,
      triggerKind: insight.triggerKind,
      status: insight.status,
      attempts: insight.attempts,
      result: insight.result ?? null,
      modelUsed: insight.modelUsed,
      promptTokens: insight.promptTokens,
      completionTokens: insight.completionTokens,
      costUsd: insight.costUsd,
      lastError: insight.lastError,
      completedAt: insight.completedAt,
      createdAt: insight.createdAt,
      updatedAt: insight.updatedAt,
    }
    await this.db
      .insert(contactInsights)
      .values(row)
      .onConflictDoUpdate({
        target: contactInsights.id,
        set: {
          status: row.status,
          attempts: row.attempts,
          result: row.result,
          modelUsed: row.modelUsed,
          promptTokens: row.promptTokens,
          completionTokens: row.completionTokens,
          costUsd: row.costUsd,
          lastError: row.lastError,
          completedAt: row.completedAt,
          updatedAt: row.updatedAt,
        },
      })
  }

  async findStale(olderThanMs: number): Promise<ContactInsight[]> {
    // Fetch BOTH processing (stuck workers) AND queued (jobs lost from BullMQ before pickup)
    // insights older than the stale threshold — per EDR runtime/llm-resilience.md and spec.
    const staleThreshold = new Date(Date.now() - olderThanMs)
    const rows = await this.db
      .select()
      .from(contactInsights)
      .where(
        and(
          or(
            eq(contactInsights.status, 'processing'),
            eq(contactInsights.status, 'queued'),
          ),
          lt(contactInsights.updatedAt, staleThreshold),
        ),
      )
    return rows.map(rowToInsight)
  }

  async findByContactAndTemplate(contactId: string, templateId: string): Promise<ContactInsight | null> {
    const rows = await this.db
      .select()
      .from(contactInsights)
      .where(
        and(
          eq(contactInsights.contactId, contactId),
          eq(contactInsights.templateId, templateId),
        ),
      )
      .limit(1)
    const row = rows[0]
    return row ? rowToInsight(row) : null
  }

  async findByContactId(contactId: string): Promise<ContactInsight[]> {
    const rows = await this.db
      .select()
      .from(contactInsights)
      .where(eq(contactInsights.contactId, contactId))
      .orderBy(desc(contactInsights.createdAt))
    return rows.map(rowToInsight)
  }
}
