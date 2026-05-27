# TanStack Query (@tanstack/react-query)

- **Categoría:** Estado de servidor / data fetching
- **Versión:** latest / sin pinear (greenfield — pinear con caret al inicializar)
- **Status:** Accepted
- **Decidido en fase:** context
- **Fecha:** 2026-05-17

## Por qué la elegimos

El estado de un CRM es casi todo estado de servidor (listas, detalles, paginación, mutaciones). TanStack Query resuelve cache, revalidación, estados de carga/error y mutaciones sin reinventarlo en estado de React crudo. kubb genera hooks directamente para este cliente (`@kubb/plugin-react-query`).

## Alternativas descartadas

- **fetch/axios + useEffect a mano:** reinventa cache, dedupe, revalidación; fuente de bugs.
- **Redux/RTK Query:** más boilerplate; innecesario si el estado es mayormente de servidor.

## Notas

- **Regla clave:** el estado de servidor va SIEMPRE por TanStack Query, no por `useState`/estado global. El estado global de cliente (si hace falta) es otra cosa y se decide aparte.
- Los hooks de query/mutation NO se escriben a mano: los genera kubb desde el OpenAPI (ver `kubb.md`). Se consumen, no se reescriben.
