# BullMQ

- **Categoría:** Background jobs / Cola
- **Versión:** ^5.78.1 (pinear con caret)
- **Status:** Accepted
- **Decidido en fase:** background-jobs (Fase 0 infra async)
- **Fecha:** 2026-06-16

## Por qué la elegimos

Cola sobre Redis con retry, backoff exponencial, repeatable jobs (reconciliación) y failed set (DLQ) de fábrica. Detrás del puerto `src/shared/queue` (`../runtime/background-jobs.md`).

## Alternativas descartadas

- **bull (legacy):** API más vieja, menos TypeScript-first; BullMQ es su sucesor oficial.
- **pg-boss:** cola sobre Postgres (ver redis.md — evitado por contención transaccional).
- **Implementación propia:** reinventa retry/backoff/DLQ sin valor diferencial.

## Notas

Requiere una conexión ioredis explícita con `maxRetriesPerRequest: null`. domain/application no lo importan (solo `queue.bullmq.ts`).
