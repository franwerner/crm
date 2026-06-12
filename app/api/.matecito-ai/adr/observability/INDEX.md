# Dominio: observability — Índice

**Criterio de pertenencia:** ADRs sobre la visibilidad operacional del sistema: logging, métricas, tracing y correlación. Hoy solo logging (Pending).

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [logging.md](logging.md) | **Pending** | Logging | Agregues un log, configures niveles. **Leé la razón — la política de errores (`../runtime/error-handling.md` §4.5) depende de esto.** |

## No aplican (N/A)

Concerns que la matriz marca relevantes para `api-rest` pero sin ADR propio en esta etapa.

| Concern | Razón |
|---|---|
| metrics | Prototipo local; sin recolección de métricas todavía (ligado a `logging.md`, hoy Pending). |
| tracing | Monolito single-process; sin tracing distribuido. |
| health-checks | Sin orquestador / load balancer que los consuma todavía. |
