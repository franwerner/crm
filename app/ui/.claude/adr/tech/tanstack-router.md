# TanStack Router (@tanstack/react-router)

- **Categoría:** Routing
- **Versión:** latest / sin pinear (greenfield — pinear con caret al inicializar)
- **Status:** Accepted
- **Decidido en fase:** post-bootstrap (hueco detectado al scaffoldear `app/ui`)
- **Fecha:** 2026-05-21

## Por qué la elegimos

El ADR 02 ubica el router en `src/app/` y el ADR 10 define guards de ruta, pero ninguna tech de routing estaba elegida. TanStack Router es del mismo ecosistema que TanStack Query (ya adoptado): type-safety de punta a punta en rutas y params, validación de search params con zod (coherente con ADR 03 §3.4) e integración nativa con Query. Los guards de ruta se expresan con `beforeLoad`, que encaja con el guard basado en `/me` del ADR 10.

## Alternativas descartadas

- **React Router:** estándar de facto, máxima madurez y comunidad. Descartado a favor de TanStack Router por type-safety superior, validación de search params con zod nativa y coherencia de ecosistema con TanStack Query. (Decisión del usuario.)
- **Wouter / routing a mano:** insuficiente para guards, params tipados y rutas anidadas de un CRM.

## Notas

- **Composición:** el árbol de rutas, providers y guards viven SOLO en `src/app/` (ADR 02 regla #7). Las features exponen sus componentes de ruta en `features/<f>/routes/`; `src/app/` las compone.
- **Guards:** la protección de rutas privadas se hace en `beforeLoad` consultando el auth-state (query a `/me`, ADR 10). El 401 global se maneja en el cliente/QueryClient (ADR 04 §4.1), no por ruta.
- **Search params:** validados con zod cuando una ruta los use. No se duplica validación que ya cubre el backend; la del front es para UX.
- **Modo code-based** (no file-based): el árbol se arma a mano en `src/app/` con `createRootRoute`/`createRoute`/`createRouter`. No se usa `@tanstack/router-plugin` porque su routing file-based asume un único `src/routes/` y choca con la estructura por features (ver ADR 12).
