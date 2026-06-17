# Dominio: contracts — Índice

**Criterio de pertenencia:** ADRs sobre el contrato externo de la API: documentación/OpenAPI, y los estándares compartidos del wire format de listados (paginación, gramática de filtros, ordenamiento). Es lo que `app/ui` consume vía kubb.

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [api-contract.md](api-contract.md) | Accepted | Documentación de la API (OpenAPI / contrato) | Crees/modifiques un endpoint; toques los schemas zod del borde; cambies cómo se documenta o expone la API; trabajes el contrato que consume kubb en `app/ui`. |
| [pagination.md](pagination.md) | Accepted | Estándar de paginación compartido | Diseñes/toques un endpoint de listado; agregues un método paginado al repository; consumas/expongas el envelope `Page<T>` en OpenAPI. |
| [filter-grammar.md](filter-grammar.md) | Accepted | Gramática de filtros en endpoints de listado | Agregues/modifiques filtros en un endpoint de listado; toques `buildListQuerySchema`, `applyFilterGroups`, o `ListQuery`; necesites entender la gramática DNF y el wire format. |
| [sort.md](sort.md) | Accepted | Ordenamiento server-side en endpoints de listado | Agregues/modifiques ordenamiento en un endpoint de listado; toques `buildListQuerySchema`, `ListQuery`, o el repositorio de un recurso; necesites entender el wire format `campo:dir` y la whitelist por recurso. |

## No aplican (N/A)

Concerns que la matriz marca relevantes para `api-rest` pero sin ADR propio en esta etapa.

| Concern | Razón |
|---|---|
| event-contract | La API no publica eventos ni webhooks todavía. **Confirmado N/A en Fase 2 (Enriquecimiento LLM):** el progreso del enriquecimiento se observa por **polling** del estado del insight, sin SSE/streaming hacia el cliente. No se introduce contrato de eventos. |
