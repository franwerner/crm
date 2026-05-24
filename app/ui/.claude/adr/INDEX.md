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
| [00-context.md](00-context.md) | Accepted | Contexto | Necesites entender qué es app/ui, stack, alcance, relación con app/api. |
| [01-architecture-style.md](01-architecture-style.md) | Accepted | Estilo y acoplamiento | Diseñes un feature/módulo nuevo o evalúes dónde poner lógica vs UI. |
| [02-layers-and-dependencies.md](02-layers-and-dependencies.md) | Accepted | Capas y reglas de dependencia | Crees un archivo y debas decidir dónde va; agregues un import entre features/shared/app. |
| [03-inter-layer-communication.md](03-inter-layer-communication.md) | Accepted | Comunicación entre capas | Pases datos entre hook y componente; uses tipos de kubb; valides un form; manejes estado. |
| [04-error-handling.md](04-error-handling.md) | Accepted | Manejo de errores | Manejes un error de API/render; parsees RFC 7807; agregues un Error Boundary. |
| [05-dependency-injection.md](05-dependency-injection.md) | **N/A** | DI | (No aplica — composición React. Leé la razón.) |
| [06-testing-strategy.md](06-testing-strategy.md) | **Pending** | Testing | Escribas un test. **Leé la razón — conflicto con Strict TDD Mode.** |
| [07-logging.md](07-logging.md) | **N/A** | Logging | (Cubierto por observabilidad de cliente — ver 04 §4.3, Pending. Leé la razón.) |
| [08-configuration.md](08-configuration.md) | Accepted | Configuración | Agregues una `VITE_` env var, leas config, manejes URL del API por entorno. |
| [09-data-access.md](09-data-access.md) | Accepted | Acceso a datos (kubb + Query) | Consumas la API, agregues una query/mutation, regeneres tipos, manejes query keys. |
| [10-auth.md](10-auth.md) | Accepted | Auth | Toques login/logout, protección de rutas, estado de sesión, manejo de 401. |
| [11-folder-structure.md](11-folder-structure.md) | Accepted | Estructura y naming + Atomic | Crees un archivo/carpeta/componente; dudes si va en features/ o shared/ui. |
| [12-routing.md](12-routing.md) | Accepted | Routing y guards | Definas rutas, el árbol del router, protección de rutas privadas o search params. |
| [13-styling-and-design-system.md](13-styling-and-design-system.md) | Accepted | Styling y Design System | Toques estilos, tokens, Tailwind, shadcn/ui; ubiques un componente en `shared/ui` vs feature. |
| [tech/INDEX.md](tech/INDEX.md) | — | Catálogo de tecnologías | Vayas a agregar/cambiar una dependencia. **Consultá siempre antes de instalar algo.** |

**Leyenda:** `Accepted` = vigente · `Pending` = decidir más adelante · `Not Applicable` (N/A) = decidido que no aplica · `Deferred` = postergado con condición · `Superseded` = reemplazado.

> Para ADRs con status distinto de `Accepted`, leé la sección "Razón de omisión / aplazamiento". **No asumas que la falta de decisión es un olvido** — está documentada.

## Decisiones aplazadas (revisar en modo `update`)

| Origen | Qué falta | Trigger |
|---|---|---|
| ADR 04 §4.3 | Observabilidad de errores de cliente (error tracker) | Cuando se opere en prod con usuarios reales |
| ADR 06 | Estrategia de testing | Lógica no trivial · **+ conflicto `Strict TDD Mode` del harness (decisión de proyecto)** |
| ADR 03 §3.2 | Zustand para estado de cliente global | Cuando el estado de cliente global crezca (Context degrade) |
| `app/api` ADR 10 | Refresh token + rotación (cross-paquete) | Impacta UX de re-login acá; se resuelve en `app/api` |
| ADR 13 §Pendientes | Dark mode | Cuando se priorice UI en modo oscuro (los tokens ya contemplan overrides) |

## Relación con `app/api`

Paquete autónomo. Lo único compartido es el **contrato OpenAPI** que este paquete consume con kubb. Auth: ver ADR 10 (cookie httpOnly same-site, definido en conjunto con `app/api` ADR 10).

## Estado y mantenimiento

- Última actualización: 2026-05-23
- **Actualizar decisión:** editar ADR + `Historial` + `Status` + `Última actualización`.
- **Decisión nueva:** ADR nuevo + fila en este INDEX.
- **Resolver Pending:** modo `update`, recorrer la fase, cambiar Status a `Accepted`, llenar contenido, anotar en Historial.
