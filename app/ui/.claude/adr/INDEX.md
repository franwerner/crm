# Architecture Decision Records — Index (app/ui)

Este índice te dice qué ADR consultar según lo que estés por hacer. Leé solo los relevantes a la tarea actual.

## Cómo usar este índice

1. Identificá qué tipo de tarea estás por hacer.
2. Buscá la fila correspondiente en la tabla.
3. Leé los ADRs listados antes de escribir código.
4. Si hay contradicción entre tu plan y un ADR: pará y preguntale al usuario.

## Mapa de ADRs

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [context.md](context.md) | Accepted | Contexto | Necesites entender qué es app/ui, stack, alcance, relación con app/api. |
| [architecture-style.md](architecture-style.md) | Accepted | Estilo y acoplamiento | Diseñes un feature/módulo nuevo o evalúes dónde poner lógica vs UI. |
| [layers-and-dependencies.md](layers-and-dependencies.md) | Accepted | Capas y reglas de dependencia | Crees un archivo y debas decidir dónde va; agregues un import entre features/shared/app. |
| [inter-layer-communication.md](inter-layer-communication.md) | Accepted | Comunicación entre capas | Pases datos entre hook y componente; uses tipos de kubb; valides un form; manejes estado. |
| [error-handling.md](error-handling.md) | Accepted | Manejo de errores | Manejes un error de API/render; parsees RFC 7807; agregues un Error Boundary. |
| [dependency-injection.md](dependency-injection.md) | **N/A** | DI | (No aplica — composición React. Leé la razón.) |
| [testing-strategy.md](testing-strategy.md) | **Pending** | Testing | Escribas un test. **Leé la razón — conflicto con Strict TDD Mode.** |
| [logging.md](logging.md) | **N/A** | Logging | (Cubierto por observabilidad de cliente — ver `error-handling.md` §4.3, Pending. Leé la razón.) |
| [configuration.md](configuration.md) | Accepted | Configuración | Agregues una `VITE_` env var, leas config, manejes URL del API por entorno. |
| [data-access.md](data-access.md) | Accepted | Acceso a datos (kubb + Query) | Consumas la API, agregues una query/mutation, regeneres tipos, manejes query keys. |
| [auth.md](auth.md) | Accepted | Auth | Toques login/logout, protección de rutas, estado de sesión, manejo de 401. |
| [folder-structure.md](folder-structure.md) | Accepted | Estructura y naming + Atomic | Crees un archivo/carpeta/componente; dudes si va en features/ o shared/ui. |
| [routing.md](routing.md) | Accepted | Routing y guards | Definas rutas, el árbol del router, protección de rutas privadas o search params. |
| [styling-and-design-system.md](styling-and-design-system.md) | Accepted | Styling y Design System | Toques estilos, tokens, Tailwind, shadcn/ui; ubiques un componente en `shared/ui` vs feature. |
| [schema-driven-list-views.md](schema-driven-list-views.md) | Accepted | Schema-driven list views | Construyas o toques una vista de listado (tabla/filtros/sort/search); definas columnas o filtros de una entidad; agregues un campo a un listado. |
| [crud-ui-patterns.md](crud-ui-patterns.md) | Accepted | CRUD UI: inline vs modal | Construyas un detail page; agregues edición/creación/borrado de un campo escalar o de una colección de subentidades; dudes entre `InlineField` o modal. |
| [tech/INDEX.md](tech/INDEX.md) | — | Catálogo de tecnologías | Vayas a agregar/cambiar una dependencia. **Consultá siempre antes de instalar algo.** |

**Leyenda:** `Accepted` = vigente · `Pending` = decidir más adelante · `Not Applicable` (N/A) = decidido que no aplica · `Deferred` = postergado con condición · `Superseded` = reemplazado.

> Para ADRs con status distinto de `Accepted`, leé la sección "Razón de omisión / aplazamiento". **No asumas que la falta de decisión es un olvido** — está documentada.

## Decisiones aplazadas (revisar en modo `update`)

| Origen | Qué falta | Trigger |
|---|---|---|
| `error-handling.md` §4.3 | Observabilidad de errores de cliente (error tracker) | Cuando se opere en prod con usuarios reales |
| `testing-strategy.md` | Estrategia de testing | Lógica no trivial · **+ conflicto `Strict TDD Mode` del harness (decisión de proyecto)** |
| `inter-layer-communication.md` §3.2 | Zustand para estado de cliente global | Cuando el estado de cliente global crezca (Context degrade) |
| `app/api` `auth.md` | Refresh token + rotación (cross-paquete) | Impacta UX de re-login acá; se resuelve en `app/api` |
| `styling-and-design-system.md` §Pendientes | Dark mode | Cuando se priorice UI en modo oscuro (los tokens ya contemplan overrides) |

## Relación con `app/api`

Paquete autónomo. Lo único compartido es el **contrato OpenAPI** que este paquete consume con kubb. Auth: ver `auth.md` (cookie httpOnly same-site, definido en conjunto con `app/api` `auth.md`).

## Estado y mantenimiento

- Última actualización: 2026-05-26
- **Actualizar una decisión (cambio menor):** editá el ADR. El historial lo lleva git.
- **Cambiar una decisión (cambio de fondo):** creá un ADR nuevo, marcá el viejo `Superseded` con link al nuevo.
- **Decisión nueva:** creá el ADR y sumá fila a este INDEX.
- **Resolver un Pending:** en modo `update`, recorré la fase, cambiá Status a `Accepted`, llená el contenido.
