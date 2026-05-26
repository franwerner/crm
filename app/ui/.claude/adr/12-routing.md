# ADR 12 — Routing y protección de rutas (app/ui)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-21
- **Última actualización:** 2026-05-25
- **Decisores:** ifran
- **Fase del bootstrap:** post-bootstrap (hueco detectado al scaffoldear)

## Contexto

El ADR 02 ubica el router en `src/app/` (regla #7: única capa que compone varias features) y el ADR 10 define guards de ruta basados en el auth-state (`/me`). Faltaba elegir la librería de routing y fijar dónde viven el árbol de rutas y los guards. La tech quedó registrada en `tech/tanstack-router.md`.

## Decisión

- **Librería:** TanStack Router (ver `tech/tanstack-router.md`).
- **Ubicación del árbol de rutas:** en `src/app/` exclusivamente. Es la única capa que importa varias features para componer el router (ADR 02 regla #7).
- **Definiciones de ruta por feature:** cada feature define sus rutas en `features/<f>/routes/` como factories (`create<F>Routes(parentRoute: AnyRoute) → Route[]`). Las pantallas/containers viven en `features/<f>/views/`. `src/app/` importa las factories, les inyecta el padre y ensambla el árbol final; las features NO se importan entre sí (regla #1).
- **Guards (rutas privadas):** se expresan con `beforeLoad`, consultando el auth-state (query a `/me`, ADR 10). Si no hay sesión → redirect a login. Centralizado en `src/app/`, nunca por componente.
- **401 global:** se maneja en el cliente/QueryClient (ADR 04 §4.1: limpiar auth-state + redirigir a login), no en cada ruta. El guard cubre el acceso inicial; el 401 cubre la expiración en runtime.
- **Search params:** cuando una ruta los use, se validan con zod (coherente con ADR 03 §3.4). Validación de UX, no fuente de verdad.
- **Modo:** **routing code-based** (árbol armado a mano con `createRootRoute`/`createRoute`/`createRouter` en `src/app/`). NO se usa el routing file-based de `@tanstack/router-plugin`: su convención escanea un único `src/routes/` y contradice la estructura por features (ADR 02 #1 y #7). El árbol se compone en `src/app/` referenciando los componentes de ruta de cada `features/<f>/routes/`.

## Alternativas consideradas

- **React Router:** ver alternativas descartadas en `tech/tanstack-router.md`.
- **Guards por componente (HOC/wrapper):** descartado — dispersa la lógica de auth; el ADR 10 exige centralización en `src/app/`.

## Consecuencias

**Positivas:** rutas y params tipados; guards centralizados coherentes con ADR 10; coherencia de ecosistema con TanStack Query.

**Negativas / trade-offs:** TanStack Router es más nuevo que React Router (comunidad menor); curva de aprendizaje del modelo de rutas tipadas.

## Reglas concretas

- El árbol de rutas, providers y guards (ensamblado final) viven SOLO en `src/app/` (ADR 02 regla #7).
- Factories de ruta en `features/<f>/routes/`; pantallas/containers en `features/<f>/views/`; nunca import feature→feature.
- Protección de rutas privadas vía `beforeLoad` + auth-state (`/me`), nunca por componente.
- 401 en runtime → manejo global (ADR 04 §4.1), no por ruta.
- Search params validados con zod cuando se usen.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-21 | Decisión inicial. TanStack Router; árbol y guards en `src/app/`; guards vía `beforeLoad` + `/me` | ifran |
| 2026-05-25 | Pantallas pasan a `features/<f>/views/`; `features/<f>/routes/` contiene factories de ruta (`create<F>Routes(parentRoute: AnyRoute)`). `app/router.tsx` queda como ensamblador puro. `RouterContext` expuesto en `shared/lib/config/query-client.ts` para uso en factories sin importar de `app/`. | ifran |
