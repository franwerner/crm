# Dominio: `runtime` — Decisiones

Comportamiento del sistema en ejecución: manejo y formato de errores, boundary handling, trabajos asíncronos/colas y resiliencia ante dependencias externas.

## EDRs en este dominio

| EDR | Status | Type | Consultá cuando... |
|---|---|---|---|
| [error-handling.md](error-handling.md) | Accepted | policy | Tires/atrapes una excepción; definas un error custom; respondas un error desde un endpoint. |
| [background-jobs.md](background-jobs.md) | Accepted | decision | Encoles un job, definas un handler/worker o toques reconciliación. |
| [llm-resilience.md](llm-resilience.md) | Accepted | decision | Toques la estrategia de retry del enriquecimiento LLM, el tracking del último error por intento, la reconciliación de insights colgados, o la decisión de delegar rotación/fallback al gateway externo. |

## No aplican en este dominio

| Concern | Razón |
|---|---|
| concurrency-async | Bun single-process con `async/await` estándar; sin concurrencia manual ni estado compartido que coordinar. |
| caching | Sin necesidad de caching en esta etapa; las lecturas van directo a Postgres. |

**Leyenda de status:** `Accepted` · `Pending` · `Not Applicable` · `Deferred` · `Superseded`.
