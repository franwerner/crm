# Architecture Decision Records — Index (app/api)

Este índice te dice qué ADR consultar según lo que estés por hacer. Leé solo los relevantes a la tarea actual.

## Cómo usar este índice

1. Identificá qué tipo de tarea estás por hacer.
2. Buscá la fila correspondiente en la tabla.
3. Leé los ADRs listados antes de escribir código.
4. Si hay contradicción entre tu plan y un ADR: pará y preguntale al usuario.

## Mapa de ADRs

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [context.md](context.md) | Accepted | Contexto del proyecto | Necesites entender qué tipo de proyecto es, stack, equipo, alcance. |
| [architecture-style.md](architecture-style.md) | Accepted | Estilo arquitectónico y acoplamiento | Diseñes un módulo/feature nuevo o evalúes introducir una abstracción. |
| [layers-and-dependencies.md](layers-and-dependencies.md) | Accepted | Capas y reglas de dependencia | Crees un archivo nuevo y debas decidir dónde va; agregues un import entre capas/slices; necesites datos de otro módulo (colaboración cross-slice por read-port). |
| [inter-layer-communication.md](inter-layer-communication.md) | Accepted | Comunicación entre capas | Pases datos entre handler/use-case/repo; decidas DTO vs entidad; ubiques validación; coordines slices. |
| [error-handling.md](error-handling.md) | Accepted | Manejo de errores | Tires/atrapes una excepción; definas un error custom; respondas un error desde un endpoint. |
| [dependency-injection.md](dependency-injection.md) | Accepted | DI | Conectes una dependencia, instancies un servicio, agregues un módulo a la composición. |
| [testing-strategy.md](testing-strategy.md) | **Pending** | Testing | Escribas un test, decidas si testear algo. **Leé la razón de aplazamiento — hay conflicto con Strict TDD Mode.** |
| [logging.md](logging.md) | **Pending** | Logging | Agregues un log, configures niveles. **Leé la razón — la política de errores (04.5) depende de esto.** |
| [configuration-secrets.md](configuration-secrets.md) | Accepted | Configuración y secretos | Agregues una env var, leas configuración, manejes secrets. |
| [data-access.md](data-access.md) | Accepted | Acceso a datos | Escribas una query, definas migraciones, manejes transacciones. |
| [auth.md](auth.md) | Accepted | Auth | Toques login, permisos, tokens, middleware de autorización. |
| [folder-structure.md](folder-structure.md) | Accepted | Estructura de carpetas y naming | Crees un archivo o carpeta nueva; cuestiones cómo nombrar algo. |
| [api-documentation.md](api-documentation.md) | Accepted | Documentación de la API (OpenAPI / contrato) | Crees/modifiques un endpoint; toques los schemas zod del borde; cambies cómo se documenta o expone la API; trabajes el contrato que consume kubb en `app/ui`. |
| [data-modeling-conventions.md](data-modeling-conventions.md) | Accepted | Convenciones de modelado de datos | Crees/edites tablas Drizzle, definas IDs, timestamps, borrado, enums o naming de DB. |
| [pagination.md](pagination.md) | Accepted | Estándar de paginación compartido | Diseñes/toques un endpoint de listado; agregues un método paginado al repository; consumas/expongas el envelope `Page<T>` en OpenAPI. |
| [filter-grammar.md](filter-grammar.md) | Accepted | Gramática de filtros en endpoints de listado | Agregues/modifiques filtros en un endpoint de listado; toques `buildListQuerySchema`, `applyFilterGroups`, o `ListQuery`; necesites entender la gramática DNF y el wire format. |
| [sort.md](sort.md) | Accepted | Ordenamiento server-side en endpoints de listado | Agregues/modifiques ordenamiento en un endpoint de listado; toques `buildListQuerySchema`, `ListQuery`, o el repositorio de un recurso; necesites entender el wire format `campo:dir` y la whitelist por recurso. |
| [read-models-for-lists.md](read-models-for-lists.md) | Accepted | Read models para listas (CQRS-lite) | Crees/modifiques un endpoint de listado que necesite proyección enriquecida (JOINs, datos relacionados); crees un `*.query.ts` o `*.query.drizzle.ts`; entiendas la separación entre reads de lista y reads/writes de dominio. |
| [contact-state-machine.md](contact-state-machine.md) | Accepted | Máquina de estados del pipeline de Contact (event-only) | Toques transiciones de estado en `contacts`, agregues/modifiques `EventType` o `PipelineState`, edites `domain/policies.ts`, `Contact.registerEvent`, o cualquier punto que mencionaba `stateLocked` / `changeStateManually`. |
| [file-storage.md](file-storage.md) | Accepted | Storage de archivos (object storage) | Manejes upload/download de archivos; agregues una entidad con documentos asociados; definas convención de keys de bucket, MIME whitelist o políticas de acceso. |
| [tech/INDEX.md](tech/INDEX.md) | — | Catálogo de tecnologías concretas | Vayas a agregar/cambiar una dependencia, lib, framework, DB, ORM, herramienta. **Consultá siempre antes de instalar algo nuevo.** |

**Leyenda de status:** `Accepted` = decisión vigente · `Pending` = decidir más adelante · `Not Applicable` = decidido conscientemente que no aplica · `Deferred` = postergado con condición de revisión · `Superseded` = reemplazado por otro ADR.

> Para los ADRs con status distinto de `Accepted`, leer la sección "Razón de omisión / aplazamiento" del archivo correspondiente. **No asumas que la falta de decisión es un olvido** — está documentada.

## Decisiones aplazadas (revisar en modo `update`)

| Origen | Qué falta decidir | Trigger esperado |
|---|---|---|
| `testing-strategy.md` | Estrategia de testing completa | Cuando haya lógica de negocio no trivial · **además: conflicto con `Strict TDD Mode: enabled` del harness** |
| `logging.md` | Estrategia de logging | Cuando se opere en entorno real / deje de ser prototipo local |
| `inter-layer-communication.md` §3.2 | Eventos de dominio in-process | Cuando la orquestación cross-slice ensucie el composition root |
| `data-access.md` §tx | Port de Unit of Work | Cuando un use-case necesite atomicidad sobre más de un repo |
| `auth.md` §refresh | Refresh token + rotación | Cuando sesiones largas o revocación sean requisito real |
| `pagination.md` §cursor | Paginación cursor-based | Cuando offset no escale o el ordenamiento haga inestable la paginación offset |

## Estado y mantenimiento

- Última actualización: 2026-05-26
- Cada ADR tiene su propio `Status:`.
- **Actualizar una decisión (cambio menor):** editá el ADR. El historial lo lleva git.
- **Cambiar una decisión (cambio de fondo):** creá un ADR nuevo, marcá el viejo `Superseded` con link al nuevo. No edites la decisión vieja en el lugar.
- **Decisión nueva:** creá el ADR y sumá fila a este INDEX.
- **Resolver un Pending:** en modo `update`, recorré las preguntas de esa fase, cambiá Status a `Accepted`, llená el contenido.
