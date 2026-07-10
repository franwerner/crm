# EDR — Routing y protección de rutas (app/ui)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-21
- **Última actualización:** 2026-05-25
- **Decisores:** ifran
- **Fase:** routing

## Contexto

El `../structure/layers-and-dependencies.md` ubica el router en `src/app/` (regla #7: única capa que compone varias features) y el `../security/auth.md` define guards de ruta basados en el auth-state (`/me`). Faltaba elegir la librería de routing y fijar dónde viven el árbol de rutas y los guards. La tech quedó registrada en `../tech/tanstack-router.md`.

## Decisión

- **Librería:** TanStack Router (ver `../tech/tanstack-router.md`).
- **Ubicación del árbol de rutas:** en `src/app/` exclusivamente. Es la única capa que importa varias features para componer el router (`../structure/layers-and-dependencies.md` regla #7).
- **Definiciones de ruta por feature:** cada feature define sus rutas en `features/<f>/routes/` como factories (`create<F>Routes(parentRoute: AnyRoute) → Route[]`). Las pantallas/containers viven en `features/<f>/views/`. `src/app/` importa las factories, les inyecta el padre y ensambla el árbol final; las features NO se importan entre sí (regla #1).
- **Guards (rutas privadas):** se expresan con `beforeLoad`, consultando el auth-state (query a `/me`, `../security/auth.md`). Si no hay sesión → redirect a login. Centralizado en `src/app/`, nunca por componente.
- **401 global:** se maneja en el cliente/QueryClient (`../runtime/error-handling.md` §4.1: limpiar auth-state + redirigir a login), no en cada ruta. El guard cubre el acceso inicial; el 401 cubre la expiración en runtime.
- **Search params:** cuando una ruta los use, se validan con zod (coherente con `../structure/inter-layer-communication.md` §3.4). Validación de UX, no fuente de verdad.
- **Modo:** **routing code-based** (árbol armado a mano con `createRootRoute`/`createRoute`/`createRouter` en `src/app/`). NO se usa el routing file-based de `@tanstack/router-plugin`: su convención escanea un único `src/routes/` y contradice la estructura por features (`../structure/layers-and-dependencies.md` #1 y #7). El árbol se compone en `src/app/` referenciando los componentes de ruta de cada `features/<f>/routes/`.

## Alternativas consideradas

- **React Router:** ver alternativas descartadas en `../tech/tanstack-router.md`.
- **Guards por componente (HOC/wrapper):** descartado — dispersa la lógica de auth; el `../security/auth.md` exige centralización en `src/app/`.

## Consecuencias

**Positivas:** rutas y params tipados; guards centralizados coherentes con `../security/auth.md`; coherencia de ecosistema con TanStack Query.

**Negativas / trade-offs:** TanStack Router es más nuevo que React Router (comunidad menor); curva de aprendizaje del modelo de rutas tipadas.

## Reglas concretas

- El árbol de rutas, providers y guards (ensamblado final) viven SOLO en `src/app/` (`../structure/layers-and-dependencies.md` regla #7).
- Factories de ruta en `features/<f>/routes/`; pantallas/containers en `features/<f>/views/`; nunca import feature→feature.
- Protección de rutas privadas vía `beforeLoad` + auth-state (`/me`), nunca por componente.
- 401 en runtime → manejo global (`../runtime/error-handling.md` §4.1), no por ruta.
- Search params validados con zod cuando se usen.
