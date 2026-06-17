# Redis

- **Categoría:** Infraestructura / Cola y cache
- **Versión:** 7-alpine image (sin pinear fino en dev)
- **Status:** Accepted
- **Decidido en fase:** background-jobs (Fase 0 infra async)
- **Fecha:** 2026-06-16

## Por qué la elegimos

Backing store de BullMQ para colas durables de background jobs (`../runtime/background-jobs.md`). Estado en vuelo efímero; el estado durable real vive en Postgres.

## Alternativas descartadas

- **Postgres como cola (pg-boss):** evita una pieza de infra, pero acopla jobs a la DB transaccional (contención de locks, performance).
- **Cloud (SQS):** overkill para greenfield self-hosted; añade dependencia de AWS.

## Notas

Service en docker-compose; consumido vía `REDIS_URL`. La app conecta con ioredis (`../tech/ioredis.md`).
