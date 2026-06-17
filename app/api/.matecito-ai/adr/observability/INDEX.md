# Dominio: observability — Índice

**Criterio de pertenencia:** ADRs sobre la visibilidad operacional del sistema: logging, métricas, tracing y correlación.

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [logging.md](logging.md) | **Accepted** | Logging (pino + interface Logger) | Agregues un log, configures niveles, toques request-logger o request-id. **La política §4.5 de error-handling depende de esto y ahora es obligatoria.** |

## No aplican (N/A)

Concerns que la matriz marca relevantes para `api-rest` pero sin ADR propio en esta etapa.

| Concern | Razón |
|---|---|
| metrics | Sin recolección de métricas todavía. |
| tracing | Monolito single-process; sin tracing distribuido. |
| health-checks | Sin orquestador / load balancer que los consuma todavía. |
