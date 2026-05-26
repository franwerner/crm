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
| [00-context.md](00-context.md) | Accepted | Contexto del proyecto | Necesites entender qué tipo de proyecto es, stack, equipo, alcance. |
| [01-architecture-style.md](01-architecture-style.md) | Accepted | Estilo arquitectónico y acoplamiento | Diseñes un módulo/feature nuevo o evalúes introducir una abstracción. |
| [02-layers-and-dependencies.md](02-layers-and-dependencies.md) | Accepted | Capas y reglas de dependencia | Crees un archivo nuevo y debas decidir dónde va; agregues un import entre capas/slices; necesites datos de otro módulo (colaboración cross-slice por read-port). |
| [03-inter-layer-communication.md](03-inter-layer-communication.md) | Accepted | Comunicación entre capas | Pases datos entre handler/use-case/repo; decidas DTO vs entidad; ubiques validación; coordines slices. |
| [04-error-handling.md](04-error-handling.md) | Accepted | Manejo de errores | Tires/atrapes una excepción; definas un error custom; respondas un error desde un endpoint. |
| [05-dependency-injection.md](05-dependency-injection.md) | Accepted | DI | Conectes una dependencia, instancies un servicio, agregues un módulo a la composición. |
| [06-testing-strategy.md](06-testing-strategy.md) | **Pending** | Testing | Escribas un test, decidas si testear algo. **Leé la razón de aplazamiento — hay conflicto con Strict TDD Mode.** |
| [07-logging.md](07-logging.md) | **Pending** | Logging | Agregues un log, configures niveles. **Leé la razón — la política de errores (04.5) depende de esto.** |
| [08-configuration-secrets.md](08-configuration-secrets.md) | Accepted | Configuración y secretos | Agregues una env var, leas configuración, manejes secrets. |
| [09-data-access.md](09-data-access.md) | Accepted | Acceso a datos | Escribas una query, definas migraciones, manejes transacciones. |
| [10-auth.md](10-auth.md) | Accepted | Auth | Toques login, permisos, tokens, middleware de autorización. |
| [11-folder-structure.md](11-folder-structure.md) | Accepted | Estructura de carpetas y naming | Crees un archivo o carpeta nueva; cuestiones cómo nombrar algo. |
| [12-api-documentation.md](12-api-documentation.md) | Accepted | Documentación de la API (OpenAPI / contrato) | Crees/modifiques un endpoint; toques los schemas zod del borde; cambies cómo se documenta o expone la API; trabajes el contrato que consume kubb en `app/ui`. |
| [13-data-modeling-conventions.md](13-data-modeling-conventions.md) | Accepted | Convenciones de modelado de datos | Crees/edites tablas Drizzle, definas IDs, timestamps, borrado, enums o naming de DB. |
| [14-pagination.md](14-pagination.md) | Accepted | Estándar de paginación compartido | Diseñes/toques un endpoint de listado; agregues un método paginado al repository; consumas/expongas el envelope `Page<T>` en OpenAPI. |
| [15-filter-grammar.md](15-filter-grammar.md) | Accepted | Gramática de filtros en endpoints de listado | Agregues/modifiques filtros en un endpoint de listado; toques `buildListQuerySchema`, `applyFilterGroups`, o `ListQuery`; necesites entender la gramática DNF y el wire format. |
| [16-sort.md](16-sort.md) | Accepted | Ordenamiento server-side en endpoints de listado | Agregues/modifiques ordenamiento en un endpoint de listado; toques `buildListQuerySchema`, `ListQuery`, o el repositorio de un recurso; necesites entender el wire format `campo:dir` y la whitelist por recurso. |
| [17-read-models-for-lists.md](17-read-models-for-lists.md) | Accepted | Read models para listas (CQRS-lite) | Crees/modifiques un endpoint de listado que necesite proyección enriquecida (JOINs, datos relacionados); crees un `*.query.ts` o `*.query.drizzle.ts`; entiendas la separación entre reads de lista y reads/writes de dominio. |
| [18-contact-state-machine.md](18-contact-state-machine.md) | Accepted | Máquina de estados del pipeline de Contact (event-only) | Toques transiciones de estado en `contacts`, agregues/modifiques `EventType` o `PipelineState`, edites `domain/policies.ts`, `Contact.registerEvent`, o cualquier punto que mencionaba `stateLocked` / `changeStateManually`. |
| [19-file-storage.md](19-file-storage.md) | Accepted | Storage de archivos (object storage) | Manejes upload/download de archivos; agregues una entidad con documentos asociados; definas convención de keys de bucket, MIME whitelist o políticas de acceso. |
| [tech/INDEX.md](tech/INDEX.md) | — | Catálogo de tecnologías concretas | Vayas a agregar/cambiar una dependencia, lib, framework, DB, ORM, herramienta. **Consultá siempre antes de instalar algo nuevo.** |

**Leyenda de status:** `Accepted` = decisión vigente · `Pending` = decidir más adelante · `Not Applicable` = decidido conscientemente que no aplica · `Deferred` = postergado con condición de revisión · `Superseded` = reemplazado por otro ADR.

> Para los ADRs con status distinto de `Accepted`, leer la sección "Razón de omisión / aplazamiento" del archivo correspondiente. **No asumas que la falta de decisión es un olvido** — está documentada.

## Decisiones aplazadas (revisar en modo `update`)

| Origen | Qué falta decidir | Trigger esperado |
|---|---|---|
| ADR 06 | Estrategia de testing completa | Cuando haya lógica de negocio no trivial · **además: conflicto con `Strict TDD Mode: enabled` del harness** |
| ADR 07 | Estrategia de logging | Cuando se opere en entorno real / deje de ser prototipo local |
| ADR 03 (§3.2) | Eventos de dominio in-process | Cuando la orquestación cross-slice ensucie el composition root |
| ADR 09 (§tx) | Port de Unit of Work | Cuando un use-case necesite atomicidad sobre más de un repo |
| ADR 10 (§refresh) | Refresh token + rotación | Cuando sesiones largas o revocación sean requisito real |
| ADR 14 (§cursor) | Paginación cursor-based | Cuando offset no escale o el ordenamiento haga inestable la paginación offset |

## Estado y mantenimiento

- Última actualización: 2026-05-26 (ADR 19 estrategia de bucket corregida: Bun.S3Client no expone createBucket, bucket pre-existencia obligatoria, bootstrap externo; ADR 19 lifecycle revisado: hard delete coordinado DB → MinIO al implementar F4 del módulo projects, sub-decisión Pending de limpieza de huérfanos eliminada; ADR 19 nuevo: storage de archivos con MinIO + Bun.s3 nativo, upload proxy + download presigned, naming de keys, caps de tamaño/TTL, MIME whitelist; ADR 18 nuevo: máquina de estados del pipeline de Contact pasa a modelo event-only — agrega `AtRisk`, eventos `Discarded`/`Reopened`, elimina `changeStateManually` y `stateLocked`)
- Cada ADR tiene su propio `Status:`.
- **Para actualizar una decisión:** editá el ADR, agregá entrada en `Historial`, actualizá `Status` y `Última actualización`.
- **Para una decisión nueva:** creá un ADR nuevo y sumá fila en este INDEX.
- **Para deprecar una decisión:** cambiá `Status: Superseded`, referenciá el ADR que la reemplaza.
- **Para resolver un Pending:** en modo `update`, recorré las preguntas de esa fase, cambiá Status a `Accepted`, llená Decisión/Alternativas/Consecuencias, anotá en Historial.
