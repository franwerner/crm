# ADR — Máquina de estados del pipeline de Contact (event-only)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-26
- **Última actualización:** 2026-05-26 (regla de eventos permitidos en `Discarded`)
- **Decisores:** Franco
- **Fase:** contact-state-machine
- **ADRs relacionados:** [`layers-and-dependencies.md`](layers-and-dependencies.md), [`inter-layer-communication.md`](inter-layer-communication.md), [`data-modeling-conventions.md`](data-modeling-conventions.md)

## Contexto

El módulo `contacts` modela un pipeline de ventas con estados `Contact → Lead → Customer` (camino feliz) y `Discarded` para descarte. Hasta esta decisión, el agregado `Contact` permitía dos formas de cambiar el estado del pipeline:

1. **Automática por eventos** — `Contact.registerEvent` mapea ciertos `EventType` a un target state vía `resolveTargetState` y aplica la transición sólo si `isForwardTransition` la considera válida y `stateLocked === false`.
2. **Manual** — `Contact.changeStateManually` fija el estado a discreción de un usuario y setea `stateLocked = true`, que desactiva las futuras transiciones automáticas.

Problemas detectados con ese modelo:

- **Trazabilidad híbrida.** Las transiciones automáticas se registran en `ContactStateChange` con `cause: { kind: 'event', eventId }`; las manuales con `cause: { kind: 'manual', userId }`. La auditoría queda partida y los reportes deben distinguir dos orígenes.
- **`Discarded` inalcanzable por eventos.** El catálogo actual `resolveTargetState` no mapea ningún `EventType` a `Discarded`, y `isForwardTransition` rechaza cualquier transición desde o hacia `Discarded` (`STATE_ORDER[Discarded] = 3` queda aislado por las dos reglas explícitas). La única forma de descartar es manual, lo que rompe la trazabilidad por evento exactamente en el caso negativo más importante.
- **Falta de buffer entre Lead y Discarded.** Un Lead que recibe `ProposalRejected` no tiene forma de marcar "se está enfriando, todavía no lo descartamos". O sigue siendo Lead (oculta la pérdida de tracción) o un operador lo descarta a mano (pierde el matiz reversible).
- **`stateLocked` agrega complejidad operativa.** Un Lead manualmente movido queda con `stateLocked = true` y deja de auto-avanzar; pero como `changeStateManually` no chequea el lock, sigue siendo editable a mano. El campo expresa una semántica que sólo aplica a uno de los dos caminos de cambio.

## Decisión

**Pasar a un modelo event-only para las transiciones de estado del pipeline.** Todas las transiciones de `pipelineState` se producen exclusivamente al registrar eventos sobre el contacto. Se elimina el cambio manual de estado, el campo `stateLocked` y la noción de bloqueo. Se agrega un estado intermedio `AtRisk` como buffer reversible entre `Lead` y `Discarded`, y dos eventos nuevos (`Discarded`, `Reopened`) que dan acceso al estado terminal negativo y a su reactivación.

### Estados (5)

| Estado | Significado |
|---|---|
| `Contact` | Estado inicial; contacto registrado sin engagement comprobado. |
| `Lead` | Engagement confirmado (respondió, hubo reunión/llamada o se envió propuesta). |
| `AtRisk` | Lead enfriado: tuvo engagement pero perdió tracción (ej.: recibió propuesta rechazada). Reversible a `Lead`. |
| `Customer` | Cierre positivo (propuesta ganada). Terminal positivo. |
| `Discarded` | Descartado por decisión explícita. Terminal salvo `Reopened`. |

### Eventos

Existentes (sin cambios en nombre ni significado):

`FirstContact`, `MessageSent`, `ResponseReceived`, `MeetingCall`, `ProposalSent`, `ProposalWon`, `ProposalRejected`, `FollowUpPending`, `Note`.

Nuevos:

- **`Discarded`** — el operador marca el descarte de manera explícita. El campo `detail` del evento queda como razón del descarte. Es el único camino para llegar al estado `Discarded`.
- **`Reopened`** — reactivación de un contacto descartado. Vuelve a `Contact`; la próxima interacción real (respuesta, reunión, propuesta) lo mueve a `Lead` por la matriz normal. No reabre directo a Lead para evitar reactivaciones implícitas.

### Matriz de transición `(currentState, eventType) → newState`

| Desde \ Evento | `ResponseReceived` `MeetingCall` `ProposalSent` | `ProposalWon` | `ProposalRejected` | `Discarded` | `Reopened` |
|---|---|---|---|---|---|
| `Contact` | → `Lead` | → `Customer` | (no-op) | → `Discarded` | (no-op) |
| `Lead` | (no-op) | → `Customer` | → `AtRisk` | → `Discarded` | (no-op) |
| `AtRisk` | → `Lead` | → `Customer` | (no-op) | → `Discarded` | (no-op) |
| `Customer` | (no-op) | (no-op) | (no-op) | (no-op) | (no-op) |
| `Discarded` | (no-op) | (no-op) | (no-op) | (no-op) | → `Contact` |

Eventos que **nunca** producen transición (sólo se registran en el timeline) en cualquier estado: `FirstContact`, `MessageSent`, `FollowUpPending`, `Note`.

Notas semánticas:

- **`Customer` es terminal positivo:** ningún evento del catálogo actual lo mueve. Si más adelante se requiere modelar churn / cancelación, se introduce un evento dedicado (ej.: `ChurnedOut`) y se actualiza este ADR.
- **`Discarded` es terminal estricto, reversible sólo vía `Reopened`:** ningún otro evento puede registrarse sobre un Discarded (ver "Eventos permitidos por estado"). Esto evita reactivaciones implícitas y refleja que un descartado está fuera del pipeline hasta que alguien lo reabra explícitamente.
- **`AtRisk` es buffer reversible:** una nueva interacción real (Response/Meeting/Proposal) lo devuelve a Lead. `ProposalRejected` desde AtRisk es no-op (no se acumula enfriamiento).
- **`ProposalRejected` no descarta:** un Lead puede recibir varios rechazos y seguir en `AtRisk`. El descarte requiere acto explícito (`Discarded`).

### Eventos permitidos por estado

`Contact.registerEvent` rechaza eventos que no estén en la lista permitida para el estado actual del contacto, no sólo los que no transicionan. Política:

| Estado | Eventos permitidos |
|---|---|
| `Contact`, `Lead`, `AtRisk`, `Customer` | Todos los del catálogo (incluyendo eventos sin transición: `Note`, `FollowUpPending`, `MessageSent`, etc.) |
| `Discarded` | **Sólo** `Reopened` |

En `Customer` el dominio acepta cualquier evento (queda en timeline) aunque sólo `Reopened` sería no-op de hecho — la asimetría con `Discarded` es deliberada: un Customer puede seguir generando registros (notas, mensajes) sin reabrirse; un Discarded está congelado hasta que se reabra explícitamente.

La política se centraliza en `domain/policies.ts` como `allowedEventsFor(state)` / `isEventAllowed(state, eventType)`. El UI espeja esta política en `app/ui/src/features/contacts/constants/pipeline-policy.ts` (`allowedEventsForState`) para filtrar el selector en `RegisterEventModal`. Si la política cambia en el dominio, el UI debe actualizarse en el mismo PR.

### Implementación de referencia

1. **`PipelineState`** (`domain/types/pipeline-state.ts`): agregar `AtRisk`.
2. **`EventType`** (`domain/types/event-type.ts`): agregar `Discarded`, `Reopened`.
3. **`domain/policies.ts`**: reemplazar `resolveTargetState` + `isForwardTransition` + `STATE_ORDER` por una única función pública de transición más una de autorización:
   ```ts
   export function applyTransition(
     current: PipelineState,
     eventType: EventType,
   ): PipelineState | null

   export function allowedEventsFor(state: PipelineState): readonly EventType[]
   export function isEventAllowed(state: PipelineState, eventType: EventType): boolean
   ```
   `applyTransition` devuelve el nuevo estado o `null` si la celda de la matriz es no-op. `allowedEventsFor` define qué eventos puede recibir un contacto en un estado dado (ver "Eventos permitidos por estado"). Implementadas como lookup explícito, no como cálculo de orden.
4. **`Contact.registerEvent`** valida primero con `isEventAllowed` (tira `BusinessRuleError` si el evento no está permitido en el estado actual), luego usa `applyTransition`. Deja de chequear `stateLocked`.
5. **`Contact.changeStateManually`**: eliminado del agregado.
6. **`stateLocked`**: eliminado del agregado, de los DTOs (in/out), del repositorio, de las queries (lista y detalle) y del schema Drizzle.
7. **HTTP**: eliminada la ruta/controller `PATCH /contacts/:id/state` y el use-case `contact-change-state`.
8. **`ContactStateChange.cause`**: el discriminante `kind: 'manual' | 'event'` se reduce a `kind: 'event'` (literal único). Se simplifican los tipos.
9. **Migración Drizzle**: ampliar enums `pipeline_state` (sumar `AtRisk`) y `event_type` (sumar `Discarded`, `Reopened`); dropear la columna `state_locked` de `contacts`.

## Alternativas consideradas

- **Mantener cambio manual + automático (status quo).** Rechazada: trazabilidad híbrida, `stateLocked` con semántica débil, complejidad operativa sin ganancia clara.
- **Event-only sin `AtRisk` (sólo 4 estados).** Rechazada: `ProposalRejected` queda sin un estado intermedio razonable. Forzar Lead→Discarded en cada rechazo es demasiado agresivo; mantenerlo como Lead oculta el enfriamiento.
- **`ProposalRejected → Discarded` automático.** Rechazada: rechazo ≠ descalificación. Un Lead puede recibir varios rechazos y seguir vivo; el descarte debe ser un acto explícito con razón.
- **`Discarded` totalmente terminal (sin `Reopened`).** Rechazada: rompe el caso de reactivación (descartado que vuelve a aparecer meses después) y obliga a duplicar el contacto, perdiendo el historial.
- **`Reopened → Lead` directo.** Rechazada: reabrir no garantiza engagement actual. Pasar por `Contact` y dejar que un evento real lo lleve a Lead mantiene la coherencia de la matriz.

## Consecuencias

**Positivas:**

- Cada transición de estado tiene un evento causal trazable (`cause.kind === 'event'` siempre). Auditoría uniforme.
- El agregado se simplifica: una sola ruta de cambio (`registerEvent`), una sola función de política (`applyTransition`), sin flag de lock.
- `AtRisk` da visibilidad operativa de Leads que necesitan atención antes del descarte.
- `Reopened` permite reactivar sin duplicar contacto, manteniendo el historial entero.
- El front no necesita un flujo separado de "cambiar estado": la edición se hace registrando el evento adecuado.

**Negativas / trade-offs:**

- No se puede corregir a mano un estado mal derivado por un evento equivocado: hay que registrar otro evento que lo lleve al estado correcto. Si el catálogo no cubre la corrección deseada, el contacto queda atrapado en ese estado. Mitigación: el catálogo actual cubre los casos esperables; en el límite, una corrección por DB es posible pero queda fuera del modelo.
- Más event types en el catálogo (`Discarded`, `Reopened`). El front debe sincronizar `eventTypeOptions`/labels al regenerar el contrato.
- Migración no trivial: ampliar enums DB, dropear `state_locked`, eliminar use-case y ruta HTTP. Requiere coordinación con `app/ui` (regen kubb, ajuste de constantes y vistas).

## Reglas concretas (verificables)

1. **`Contact` no expone método de cambio manual de estado.** Si `changeStateManually` (u otro alias) existe después de la migración, es un bug.
2. **`stateLocked` no aparece en código.** `grep -rn "stateLocked\|state_locked"` sobre `app/api/src` y `app/ui/src` debe devolver cero matches (excluyendo este ADR, archivos de migración históricos y `_journal.json` de Drizzle).
3. **`domain/policies.ts` exporta exclusivamente `applyTransition`, `allowedEventsFor` e `isEventAllowed`** (con las firmas indicadas). No debe coexistir con `resolveTargetState`, `isForwardTransition` ni `STATE_ORDER`.
4. **`ContactStateChange.cause.kind`** admite únicamente el literal `'event'`. El literal `'manual'` queda removido del tipo.
5. **No existe endpoint `PATCH /contacts/:id/state`** ni use-case `contact-change-state`.
6. **Los eventos `Discarded` y `Reopened` están registrados** en `EventType` y aplican según la matriz declarada arriba.
7. **Cualquier celda de la matriz declarada como no-op no produce `ContactStateChange`.** Sólo las celdas con flecha generan un registro de cambio.
8. **`registerEvent` rechaza eventos no permitidos en el estado actual.** En particular, sobre un contacto `Discarded` sólo se acepta `Reopened`; cualquier otro evento devuelve `BusinessRuleError`. El UI debe espejar esta política filtrando el selector de eventos.
