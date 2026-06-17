# Dominio: runtime — Índice

**Criterio de pertenencia:** ADRs sobre el comportamiento del sistema en ejecución: manejo de errores, estilo de excepciones, formato de respuesta de error y boundary handling.

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [error-handling.md](error-handling.md) | Accepted | Manejo de errores | Tires/atrapes una excepción; definas un error custom; respondas un error desde un endpoint. |
| [background-jobs.md](background-jobs.md) | Accepted | Trabajos asíncronos / colas | Encoles un job, definas un handler/worker o toques reconciliación. |
| [llm-resilience.md](llm-resilience.md) | Accepted | Resiliencia LLM (retry BullMQ + reconciliación + lastError) | Toques la estrategia de retry del enriquecimiento LLM, el tracking de lastError por intento, la reconciliación de insights stale, o la decisión de delegar rotación/fallback al gateway externo. |

## No aplican (N/A)

Concerns que la matriz marca relevantes para `api-rest` pero sin ADR propio en esta etapa.

| Concern | Razón |
|---|---|
| concurrency-async | Bun single-process con `async/await` estándar; sin concurrencia manual ni estado compartido que coordinar. |
| caching | Sin necesidad de caching en esta etapa; las lecturas van directo a Postgres. |

> **`resilience`: activado en Fase 2.** Dejó de ser N/A — ver [`llm-resilience.md`](llm-resilience.md) (Accepted). El enriquecimiento LLM (OpenRouter) es la primera dependencia externa que requiere estrategia de resiliencia (retry BullMQ + reconciliación + tracking de lastError). La rotación/fallback de modelos es responsabilidad del gateway externo.
