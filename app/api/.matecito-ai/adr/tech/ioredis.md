# ioredis

- **Categoría:** Cliente Redis (npm)
- **Versión:** ^5.11.1 (pinear con caret)
- **Status:** Accepted
- **Decidido en fase:** background-jobs (Fase 0 infra async)
- **Fecha:** 2026-06-16

## Por qué la elegimos

Cliente Redis que BullMQ exige (no acepta otros clientes). Entrada propia y no subsumida en redis.md porque es una dependencia npm con un riesgo de runtime específico (compatibilidad con Bun).

## Riesgo Bun (validar)

ioredis sobre Bun puede tener incompatibilidades de sockets. Estrategia: instanciar `new IORedis(REDIS_URL, { maxRetriesPerRequest: null })` y hacer `PING` fail-fast en el startup de API y worker; si falla → exit ≠ 0 con error explícito. NO degradar en silencio.

## Alternativas descartadas

- **Cliente nativo `Bun.redis`:** BullMQ no lo soporta.
- **node-redis:** BullMQ usa ioredis específicamente y no admite node-redis.

## Notas

Usado exclusivamente en `queue.bullmq.ts`; ningún otro archivo lo importa.
