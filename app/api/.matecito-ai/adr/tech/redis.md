# Redis

- **Categoría:** Infraestructura / Cola y cache
- **Versión:** 7-alpine image (sin pinear fino en dev)
- **Status:** Accepted
- **Decidido en fase:** background-jobs (Fase 0 infra async)
- **Fecha:** 2026-06-16

> **Revisión 2026-06-17:** Se eliminó el uso de `Bun.redis` para cooldown de modelos LLM (`ModelCooldownStore`) al delegar la rotación/fallback al gateway externo (ver `../runtime/llm-resilience.md`). `Bun.redis` queda como cliente exclusivo de cache MX del checker de canales.

## Por qué la elegimos

Backing store de BullMQ para colas durables de background jobs (`../runtime/background-jobs.md`). Estado en vuelo efímero; el estado durable real vive en Postgres. Reutilizado además como cache/estado efímero de propósito acotado: cache de resultados de MX DNS lookups del checker de canales (TTL por dominio).

## Alternativas descartadas

- **Postgres como cola (pg-boss):** evita una pieza de infra, pero acopla jobs a la DB transaccional (contención de locks, performance).
- **Cloud (SQS):** overkill para greenfield self-hosted; añade dependencia de AWS.

## Notas

Service en docker-compose; consumido vía `REDIS_URL`.

**Dos clientes Redis, por motivo (no por gusto):**
- **ioredis** (`../tech/ioredis.md`): SOLO para BullMQ, que lo exige y no admite otros clientes. Encapsulado en `queue.bullmq.ts`.
- **`Bun.redis` nativo:** para usos no-BullMQ (actualmente: cache de MX lookups del checker de canales). Cero deps, alineado con la preferencia Bun-nativo del repo (`Bun.s3` en storage, `Bun.password` en auth). Encapsulado en su adapter de infra (p. ej. `BunRedisMxCache` en `src/shared/verification/`).

ioredis NO se usa fuera de BullMQ; los usos genéricos de Redis van por `Bun.redis`.
