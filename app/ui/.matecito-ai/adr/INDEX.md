# Architecture Decision Records — Índice por dominio (app/ui)

Este índice enruta **por dominio**. Cada dominio agrupa las decisiones de un mismo eje (estructura, datos, seguridad, frontend, etc.). Identificá el dominio relevante a tu tarea, abrí su `INDEX.md` y leé solo los ADRs que apliquen.

## Cómo usar este índice

1. Identificá qué tipo de tarea estás por hacer.
2. Buscá el dominio correspondiente abajo y abrí su `<dominio>/INDEX.md`.
3. Leé los ADRs listados antes de escribir código.
4. Si hay contradicción entre tu plan y un ADR: pará y preguntale al usuario.

## Dominios con ADRs

### [context/](context/INDEX.md)
Contexto del proyecto: qué es `app/ui`, tipo (SPA), stack, equipo, alcance, madurez y relación con `app/api`. Marco para todo lo demás. **Consultá cuando** necesites entender el tipo de proyecto y sus premisas.

### [structure/](structure/INDEX.md)
Estructura del código: estilo arquitectónico y acoplamiento, capas y reglas de dependencia, comunicación entre capas y organización de carpetas/naming. **Consultá cuando** crees archivos, agregues imports entre features/shared/app, diseñes un módulo o toques la organización del código.

### [runtime/](runtime/INDEX.md)
Comportamiento en ejecución: manejo de errores (render/runtime, API, RFC 7807, Error Boundaries). **Consultá cuando** manejes un error de API/render, parsees RFC 7807 o agregues un Error Boundary.

### [data/](data/INDEX.md)
Acceso a datos: consumo del contrato OpenAPI de `app/api` vía kubb + TanStack Query, convenciones de uso y workflow de regeneración. **Consultá cuando** consumas la API, agregues una query/mutation, regeneres tipos o manejes query keys.

### [security/](security/INDEX.md)
Seguridad del frontend: autenticación (cookie httpOnly same-site), estado de sesión, protección de rutas y CSRF. **Consultá cuando** toques login/logout, protección de rutas, estado de sesión o manejo de 401.

### [delivery/](delivery/INDEX.md)
Configuración y prueba del paquete: carga/validación de config (`VITE_*`) y estrategia de testing (Pending). **Consultá cuando** agregues una env var, leas config por entorno o decidas testear algo.

### [frontend/](frontend/INDEX.md)
Capa de presentación de la SPA: styling y design system, routing y guards, vistas de listado schema-driven, patrones de CRUD UI (inline vs modal), polling de estado con `refetchInterval`, wizards multi-step con `useReducer` y navegación de sub-secciones de Configuración. **Consultá cuando** toques estilos/tokens, definas rutas, construyas una vista de listado o un detail page con edición, hagas polling de un recurso async, armes un flujo multi-step o agregues una sub-sección de Config.

## Catálogo de tecnologías

### [tech/](tech/INDEX.md)
Cross-cutting (NO es un dominio): registro vivo de las tecnologías concretas elegidas (React, Vite, TanStack Query/Router/Table, kubb, Tailwind, shadcn, etc.) con su "por qué" y alternativas descartadas. **Consultá SIEMPRE antes de agregar/cambiar una dependencia, lib, framework o herramienta.**

## Dominios sin uso

Dominios canónicos del catálogo que hoy NO tienen ADRs en este paquete:

- `observability` — única preocupación relevante (logging) está N/A: cubierto por observabilidad de cliente, ver `runtime/error-handling.md` §4.3 (Pending); sin métricas/tracing en un SPA.
- `contracts` — un SPA consume el contrato (OpenAPI de `app/api` vía kubb), no expone uno propio.
- `quality` — sin NFRs formalizados; i18n/performance no priorizados todavía.

**Reservados (sin uso):**
- `lifecycle` — sin políticas de ciclo de vida de datos/entidades formalizadas aún.
- `integration` — el consumo del API propio se trata en `data/data-access.md`; sin integraciones de terceros.
- `privacy` — sin política de privacidad/retención de PII formalizada.
- `release` — sin estrategia de release/deploy/versionado documentada todavía.
- `domain-logic` — la lógica de dominio vive en `app/api`; el front solo presenta.
- `compliance` — sin requisitos regulatorios formalizados.
- `ux-product` — decisiones de producto/UX viven en el PRD, no como ADRs de `app/ui`.

## Leyenda de status

`Accepted` = decisión vigente · `Pending` = decidir más adelante · `Not Applicable` (N/A) = decidido conscientemente que no aplica · `Deferred` = postergado con condición de revisión · `Superseded` = reemplazado por otro ADR.

> Para los ADRs con status distinto de `Accepted`, leer la sección "Razón de omisión / aplazamiento" del archivo correspondiente. **No asumas que la falta de decisión es un olvido** — está documentada.

## Decisiones aplazadas (revisar en modo `update`)

| Origen | Qué falta | Trigger |
|---|---|---|
| `runtime/error-handling.md` §4.3 | Observabilidad de errores de cliente (error tracker) | Cuando se opere en prod con usuarios reales |
| `delivery/testing-strategy.md` | Estrategia de testing | Lógica no trivial · **+ conflicto `Strict TDD Mode` del harness (decisión de proyecto)** |
| `structure/inter-layer-communication.md` §3.2 | Zustand para estado de cliente global | Cuando el estado de cliente global crezca (Context degrade) |
| `app/api` `auth.md` | Refresh token + rotación (cross-paquete) | Impacta UX de re-login acá; se resuelve en `app/api` |
| `frontend/styling-and-design-system.md` §Pendientes | Dark mode | Cuando se priorice UI en modo oscuro (los tokens ya contemplan overrides) |

## Relación con `app/api`

Paquete autónomo. Lo único compartido es el **contrato OpenAPI** que este paquete consume con kubb. Auth: ver `security/auth.md` (cookie httpOnly same-site, definido en conjunto con `app/api` `security/auth.md`). El contrato de la API vive en `app/api` `contracts/api-contract.md`.

## Estado y mantenimiento

- Última actualización: 2026-06-17
- Cada ADR tiene su propio `Status:`.
- **Actualizar una decisión (cambio menor):** editá el ADR. El historial lo lleva git.
- **Cambiar una decisión (cambio de fondo):** creá un ADR nuevo, marcá el viejo `Superseded` con link al nuevo.
- **Decisión nueva:** creá el ADR en el dominio que corresponda y sumá fila al `<dominio>/INDEX.md` (y, si es un dominio nuevo, una sección en este índice raíz).
- **Resolver un Pending:** en modo `update`, recorré la fase, cambiá Status a `Accepted`, llená el contenido.
