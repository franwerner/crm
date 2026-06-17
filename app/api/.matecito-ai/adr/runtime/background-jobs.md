# ADR — Background jobs (trabajos asíncronos)

- **Status:** Accepted
- **Fecha de creación:** 2026-06-16
- **Última actualización:** 2026-06-16
- **Decisores:** ifran
- **Fase:** background-jobs (Fase 0 infra async)

## Contexto

El CRM necesita trabajo fuera del ciclo request-response (import de datos, enriquecimiento LLM). El INDEX de runtime marcaba background-jobs como N/A ("sin trabajo asíncrono todavía"); esta fase lo activa. Referencia normativa para Fases 1 y 2.

## Decisión

**Infra:** colas BullMQ sobre Redis; conexión vía ioredis. Procesos worker SEPARADOS del API (`src/worker.ts`).

**Abstracción:** puerto `src/shared/queue` (Ports & Adapters): `QueueProducer.enqueue<T>(queue, name, data, opts)` y `WorkerRegistry.register<T>(queue, handler)` + `start()`. Impl `queue.bullmq.ts` única que toca bullmq/ioredis. Colas declaradas: `import`, `enrich-llm`.

**Contrato de handler:** `JobHandler<T> = (job: { id; name; data: T }) => Promise<void>`. Idempotente (puede re-ejecutarse por retry/reconciliación).

**Retry/backoff:** vía `JobOptions` de BullMQ — `attempts` (default por cola) + `backoff` exponencial. Agotados los intentos → DLQ.

**DLQ:** jobs fallidos terminales quedan retenidos (failed set de BullMQ / cola dedicada) para inspección; no se descartan silenciosamente.

**Reconciliación:** el estado durable vive en Postgres; Redis es efímero. Contrato `ReconciliationJob { name; run() }` registrado en el worker (repeatable job). Propósito: re-encolar registros `pending` y recuperar `processing` colgados leyéndolos de la DB. Lógica concreta por tabla (`imports`, `contact_insights`) = Fases 1/2.

**Fail-fast:** API y worker validan la conexión Redis (ioredis PING) al startup; si falla, exit ≠ 0 con error explícito (sin degradación silenciosa).

## Reglas concretas (verificables)

- domain/application NUNCA importan bullmq/ioredis: encolan vía `QueueProducer`; consumen vía `WorkerRegistry`. Solo `queue.bullmq.ts` toca las libs.
- El API NO ejecuta consumers; los consumers viven solo en el proceso worker.
- Todo handler es idempotente y deja estado durable en Postgres antes de confiar en Redis.
- ioredis se construye con `maxRetriesPerRequest: null` (requerido por BullMQ internamente para las conexiones de colas/workers). El cliente standalone usado exclusivamente para el PING fail-fast de startup puede usar `maxRetriesPerRequest: 0` (sin reintentos → exit rápido sin colgar); esto es coherente con la implementación en `src/shared/queue/queue.bullmq.ts`.

## Alternativas consideradas

- In-process (EventEmitter / promesas sueltas) — descartado: sin durabilidad, se pierde al reiniciar; §3.2 de inter-layer-communication sigue sin trigger.
- Cron del SO — descartado: fuera del runtime, sin reuso de config/DI/Logger.
- Otras colas (pg-boss sobre Postgres; SQS) — pg-boss evita Redis pero acopla jobs a la DB transaccional; SQS = infra cloud, overkill greenfield. BullMQ: maduro, retry/backoff/repeatable/DLQ de fábrica.

## Consecuencias

**Positivas:** durabilidad, retry/backoff/DLQ listos, escalado independiente del worker, contrato estable para Fases 1/2.
**Negativas:** Redis como nueva pieza de infra; riesgo ioredis+Bun (mitigado con fail-fast); el acoplamiento worker↔schema durable se mitiga con review.
