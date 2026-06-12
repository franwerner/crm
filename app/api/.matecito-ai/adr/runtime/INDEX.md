# Dominio: runtime — Índice

**Criterio de pertenencia:** ADRs sobre el comportamiento del sistema en ejecución: manejo de errores, estilo de excepciones, formato de respuesta de error y boundary handling.

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [error-handling.md](error-handling.md) | Accepted | Manejo de errores | Tires/atrapes una excepción; definas un error custom; respondas un error desde un endpoint. |

## No aplican (N/A)

Concerns que la matriz marca relevantes para `api-rest` pero sin ADR propio en esta etapa.

| Concern | Razón |
|---|---|
| concurrency-async | Bun single-process con `async/await` estándar; sin concurrencia manual ni estado compartido que coordinar. |
| background-jobs | Sin trabajo asíncrono fuera del ciclo request-response todavía. |
| resilience | Sin dependencias externas (APIs de terceros) que requieran retries/timeouts/circuit-breakers todavía. |
| caching | Sin necesidad de caching en esta etapa; las lecturas van directo a Postgres. |
