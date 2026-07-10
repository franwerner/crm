# Dominio: `observability` — Decisiones

Visibilidad operacional del sistema: logging, métricas, tracing y correlación.

## EDRs en este dominio

| EDR | Status | Type | Consultá cuando... |
|---|---|---|---|
| [logging.md](logging.md) | Accepted | decision | Agregues un log, configures niveles, o toques el request-logger o el request-id. La política de logging de errores de error-handling depende de esto y ahora es obligatoria. |

## No aplican en este dominio

| Concern | Razón |
|---|---|
| metrics | Sin recolección de métricas todavía. |
| tracing | Monolito single-process; sin tracing distribuido. |
| health-checks | Sin orquestador / load balancer que los consuma todavía. |

**Leyenda de status:** `Accepted` · `Pending` · `Not Applicable` · `Deferred` · `Superseded`.
