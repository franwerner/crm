# EDR — Background jobs (trabajos asíncronos)

- **Status:** Accepted
- **Type:** decision
- **Date:** 2026-06-16
- **Applied pattern:** Adapter — una sola implementación concreta traduce la librería de colas detrás de un puerto propio, para que dominio y aplicación no la conozcan.

## Contexto

El CRM necesita trabajo fuera del ciclo request-response (import de datos, enriquecimiento LLM). Hasta ahora no había procesamiento diferido; esta decisión introduce la infraestructura base de colas y es referencia normativa para las capacidades que dependen de ella.

## Decisión

**Infra:** colas durables sobre BullMQ + Redis (conexión vía ioredis). Los procesos worker corren SEPARADOS del proceso API.

**Abstracción:** el dominio y la aplicación encolan y consumen a través de un puerto de colas propio; una única implementación concreta toca BullMQ/ioredis. Hay una cola por tipo de trabajo (import de datos, enriquecimiento LLM).

**Contrato de handler:** un handler recibe el job y devuelve una promesa; debe ser idempotente (puede re-ejecutarse por retry o reconciliación).

**Retry/backoff:** vía las opciones nativas de BullMQ — número de intentos por cola + backoff exponencial. Agotados los intentos, el job cae a la DLQ.

**DLQ:** los jobs fallidos terminales quedan retenidos (failed set de BullMQ / cola dedicada) para inspección; no se descartan silenciosamente.

**Reconciliación:** el estado durable vive en Postgres; Redis es efímero. Un job repetible reconcilia: re-encola los registros pendientes y recupera los que quedaron colgados en proceso, leyéndolos de la DB. La lógica concreta por tabla la aportan las capacidades que la consumen.

**Fail-fast:** API y worker validan la conexión Redis al startup; si falla, terminan con código de salida ≠ 0 y error explícito (sin degradación silenciosa).

## Alcance

- `src/worker.ts` — entrypoint del proceso worker, separado del API.
- `src/shared/queue/**` — puerto de colas y su única implementación concreta (la que toca BullMQ/ioredis).

## Reglas verificables

- **[manual]** El dominio y la aplicación nunca importan BullMQ/ioredis: encolan y consumen a través del puerto de colas; solo la implementación concreta del puerto toca esas libs.
- **[manual]** El API no ejecuta consumers; los consumers viven solo en el proceso worker.
- **[manual]** Todo handler es idempotente y deja estado durable en Postgres antes de confiar en Redis.
- **[manual]** La conexión ioredis de colas/workers usa `maxRetriesPerRequest: null` (requerido por BullMQ); el cliente standalone del PING de startup usa `maxRetriesPerRequest: 0` (sin reintentos → exit rápido sin colgar).

## Alternativas consideradas

- **In-process (EventEmitter / promesas sueltas):** sin durabilidad, se pierde al reiniciar. Descartado.
- **Cron del SO:** fuera del runtime, sin reuso de config/DI/logger. Descartado.
- **Otras colas (pg-boss sobre Postgres; SQS):** pg-boss evita Redis pero acopla los jobs a la DB transaccional; SQS es infra cloud, overkill para un greenfield. BullMQ ofrece retry/backoff/repeatable/DLQ de fábrica y es maduro.

## Consecuencias

**Positivas:** durabilidad; retry/backoff/DLQ listos; escalado independiente del worker; contrato estable para las capacidades que dependen de trabajo diferido.

**Negativas / trade-offs:** Redis como nueva pieza de infra; riesgo de ioredis sobre Bun (mitigado con fail-fast); el acoplamiento entre worker y schema durable se mitiga en review.
