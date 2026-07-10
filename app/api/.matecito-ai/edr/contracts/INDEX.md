# Dominio: `contracts` — Decisiones

El contrato externo de la API: documentación/OpenAPI y los estándares compartidos del wire format de listados (paginación, gramática de filtros, ordenamiento). Es lo que el paquete de UI consume vía kubb.

## EDRs en este dominio

| EDR | Status | Type | Consultá cuando... |
|---|---|---|---|
| [api-contract.md](api-contract.md) | Accepted | convention | Crees/modifiques un endpoint; toques los schemas zod del borde; cambies cómo se documenta o expone la API; trabajes el contrato que consume kubb en el paquete de UI. |
| [pagination.md](pagination.md) | Accepted | convention | Diseñes/toques un endpoint de listado; agregues un método paginado a un repository; consumas/expongas el envelope `Page<T>` en OpenAPI. |
| [filter-grammar.md](filter-grammar.md) | Accepted | convention | Agregues/modifiques filtros en un endpoint de listado; toques el query builder o los helpers de filtros compartidos; necesites entender la gramática DNF y el wire format. |
| [sort.md](sort.md) | Accepted | convention | Agregues/modifiques ordenamiento en un endpoint de listado; toques el query builder compartido o el repositorio de un recurso; necesites entender el wire format `campo:dir` y la whitelist por recurso. |

## No aplican en este dominio

| Concern | Razón |
|---|---|
| event-contract | La API no publica eventos ni webhooks. El progreso del enriquecimiento se observa por **polling** del estado del insight, sin SSE/streaming hacia el cliente; no se introduce contrato de eventos. |

**Leyenda de status:** `Accepted` · `Pending` · `Not Applicable` · `Deferred` · `Superseded`.
