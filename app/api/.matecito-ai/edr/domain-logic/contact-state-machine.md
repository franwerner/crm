# EDR — Máquina de estados del pipeline de Contact (event-only)

- **Status:** Accepted
- **Type:** policy
- **Date:** 2026-05-26

## Contexto

El módulo `contacts` modela un pipeline de ventas con estados `Contact → Lead → Customer` (camino feliz) y `Discarded` para descarte. Hasta esta decisión, el agregado permitía dos formas de cambiar el estado del pipeline:

1. **Automática por eventos** — al registrar ciertos eventos sobre el contacto, se resolvía un estado destino y se aplicaba la transición solo si era hacia adelante y el contacto no estaba bloqueado.
2. **Manual** — un usuario fijaba el estado a discreción, lo que además activaba un bloqueo que desactivaba las futuras transiciones automáticas.

Problemas de ese modelo:

- **Trazabilidad híbrida.** Las transiciones automáticas quedaban con causa de evento y las manuales con causa de usuario. La auditoría quedaba partida y los reportes debían distinguir dos orígenes.
- **`Discarded` inalcanzable por eventos.** Ningún evento del catálogo mapeaba a `Discarded`, y la regla de "solo hacia adelante" lo dejaba aislado. La única forma de descartar era manual, lo que rompía la trazabilidad por evento justo en el caso negativo más importante.
- **Falta de buffer entre Lead y Discarded.** Un Lead cuya propuesta se rechaza no tenía forma de marcar "se está enfriando, todavía no lo descartamos": o seguía siendo Lead (ocultaba la pérdida de tracción) o un operador lo descartaba a mano (perdía el matiz reversible).
- **El bloqueo agregaba complejidad operativa.** Un Lead movido a mano quedaba bloqueado y dejaba de auto-avanzar, pero seguía siendo editable a mano; el flag expresaba una semántica que solo aplicaba a uno de los dos caminos de cambio.

## Decisión

**Pasar a un modelo event-only para las transiciones de estado del pipeline.** Todas las transiciones de estado se producen exclusivamente al registrar eventos sobre el contacto. Se elimina el cambio manual de estado y toda noción de bloqueo. Se agrega un estado intermedio `AtRisk` como buffer reversible entre `Lead` y `Discarded`, y dos eventos nuevos (`Discarded`, `Reopened`) que dan acceso al estado terminal negativo y a su reactivación.

### Estados (5)

| Estado | Significado |
|---|---|
| `Contact` | Estado inicial; contacto registrado sin engagement comprobado. |
| `Lead` | Engagement confirmado (respondió, hubo reunión/llamada o se envió propuesta). |
| `AtRisk` | Lead enfriado: tuvo engagement pero perdió tracción (ej.: propuesta rechazada). Reversible a `Lead`. |
| `Customer` | Cierre positivo (propuesta ganada). Terminal positivo. |
| `Discarded` | Descartado por decisión explícita. Terminal salvo `Reopened`. |

### Eventos

Existentes (sin cambios en nombre ni significado): `FirstContact`, `MessageSent`, `ResponseReceived`, `MeetingCall`, `ProposalSent`, `ProposalWon`, `ProposalRejected`, `FollowUpPending`, `Note`.

Nuevos:

- **`Discarded`** — el operador marca el descarte de manera explícita. El detalle del evento queda como razón del descarte. Es el único camino para llegar al estado `Discarded`.
- **`Reopened`** — reactivación de un contacto descartado. Vuelve a `Contact`; la próxima interacción real (respuesta, reunión, propuesta) lo mueve a `Lead` por la matriz normal. No reabre directo a Lead para evitar reactivaciones implícitas.

### Matriz de transición `(currentState, eventType) → newState`

| Desde \ Evento | `ResponseReceived` `MeetingCall` `ProposalSent` | `ProposalWon` | `ProposalRejected` | `Discarded` | `Reopened` |
|---|---|---|---|---|---|
| `Contact` | → `Lead` | → `Customer` | (no-op) | → `Discarded` | (no-op) |
| `Lead` | (no-op) | → `Customer` | → `AtRisk` | → `Discarded` | (no-op) |
| `AtRisk` | → `Lead` | → `Customer` | (no-op) | → `Discarded` | (no-op) |
| `Customer` | (no-op) | (no-op) | (no-op) | (no-op) | (no-op) |
| `Discarded` | (no-op) | (no-op) | (no-op) | (no-op) | → `Contact` |

Eventos que **nunca** producen transición (solo se registran en el timeline) en cualquier estado: `FirstContact`, `MessageSent`, `FollowUpPending`, `Note`.

Notas semánticas:

- **`Customer` es terminal positivo:** ningún evento del catálogo actual lo mueve. Si más adelante se requiere modelar churn/cancelación, se introduce un evento dedicado y se actualiza este EDR.
- **`Discarded` es terminal estricto, reversible solo vía `Reopened`:** ningún otro evento puede registrarse sobre un `Discarded` (ver "Eventos permitidos por estado"). Evita reactivaciones implícitas y refleja que un descartado está fuera del pipeline hasta que alguien lo reabra explícitamente.
- **`AtRisk` es buffer reversible:** una nueva interacción real (Response/Meeting/Proposal) lo devuelve a Lead. `ProposalRejected` desde `AtRisk` es no-op (no se acumula enfriamiento).
- **`ProposalRejected` no descarta:** un Lead puede recibir varios rechazos y seguir en `AtRisk`. El descarte requiere acto explícito (`Discarded`).

### Eventos permitidos por estado

El registro de un evento rechaza los eventos que no estén en la lista permitida para el estado actual del contacto, no solo los que no transicionan:

| Estado | Eventos permitidos |
|---|---|
| `Contact`, `Lead`, `AtRisk`, `Customer` | Todos los del catálogo (incluyendo eventos sin transición: `Note`, `FollowUpPending`, `MessageSent`, etc.) |
| `Discarded` | **Solo** `Reopened` |

En `Customer` el dominio acepta cualquier evento (queda en timeline) aunque solo `Reopened` sería no-op de hecho. La asimetría con `Discarded` es deliberada: un Customer puede seguir generando registros (notas, mensajes) sin reabrirse; un Discarded está congelado hasta que se reabra explícitamente. El UI espeja esta política para filtrar el selector de eventos; si la política cambia en el dominio, el UI se actualiza en el mismo PR.

## Reglas verificables

- **[manual]** El agregado `Contact` no expone ningún método de cambio manual de estado (`changeStateManually` ni alias); el estado solo cambia al registrar eventos.
- **[manual]** No existe flag de bloqueo de estado: `grep -rn "stateLocked\|state_locked"` sobre `app/api/src` y `app/ui/src` devuelve cero matches (excluyendo archivos de migración históricos y `_journal.json` de Drizzle).
- **[manual]** La política de transición vive centralizada en `src/modules/contacts/domain/policies.ts`, que expone exclusivamente `applyTransition`, `allowedEventsFor` e `isEventAllowed` (lookup explícito de la matriz, no cálculo de orden). No coexisten `resolveTargetState`, `isForwardTransition` ni `STATE_ORDER`.
- **[manual]** La causa de un cambio de estado admite únicamente el discriminante de evento (`cause.kind === 'event'`); el literal `'manual'` no existe en el tipo.
- **[manual]** No existe endpoint HTTP de cambio manual de estado (`PATCH /contacts/:id/state`) ni un use-case equivalente.
- **[manual]** Los eventos `Discarded` y `Reopened` están registrados en el catálogo de `EventType` y aplican según la matriz declarada.
- **[manual]** Cualquier celda de la matriz declarada no-op no produce un registro de cambio de estado; solo las celdas con flecha lo generan.
- **[manual]** El registro de eventos rechaza los no permitidos en el estado actual: sobre un `Discarded` solo se acepta `Reopened`; cualquier otro devuelve `BusinessRuleError`. El UI espeja esta política filtrando el selector de eventos.

## Alternativas consideradas

- **Mantener cambio manual + automático (status quo).** Rechazada: trazabilidad híbrida, flag de bloqueo con semántica débil, complejidad operativa sin ganancia clara.
- **Event-only sin `AtRisk` (solo 4 estados).** Rechazada: `ProposalRejected` queda sin un estado intermedio razonable. Forzar Lead→Discarded en cada rechazo es demasiado agresivo; mantenerlo como Lead oculta el enfriamiento.
- **`ProposalRejected → Discarded` automático.** Rechazada: rechazo ≠ descalificación. Un Lead puede recibir varios rechazos y seguir vivo; el descarte debe ser un acto explícito con razón.
- **`Discarded` totalmente terminal (sin `Reopened`).** Rechazada: rompe el caso de reactivación (descartado que reaparece meses después) y obliga a duplicar el contacto, perdiendo el historial.
- **`Reopened → Lead` directo.** Rechazada: reabrir no garantiza engagement actual. Pasar por `Contact` y dejar que un evento real lo lleve a Lead mantiene la coherencia de la matriz.

## Consecuencias

**Positivas:**

- Cada transición de estado tiene un evento causal trazable (la causa es siempre un evento). Auditoría uniforme.
- El agregado se simplifica: una sola ruta de cambio (registrar evento), una sola función de política de transición, sin flag de bloqueo.
- `AtRisk` da visibilidad operativa de Leads que necesitan atención antes del descarte.
- `Reopened` permite reactivar sin duplicar contacto, manteniendo el historial entero.
- El front no necesita un flujo separado de "cambiar estado": la edición se hace registrando el evento adecuado.

**Negativas / trade-offs:**

- No se puede corregir a mano un estado mal derivado por un evento equivocado: hay que registrar otro evento que lo lleve al estado correcto. Si el catálogo no cubre la corrección deseada, el contacto queda atrapado en ese estado. Mitigación: el catálogo actual cubre los casos esperables; en el límite, una corrección por DB es posible pero queda fuera del modelo.
- Más event types en el catálogo (`Discarded`, `Reopened`); el front debe sincronizar sus opciones/labels al regenerar el contrato.
- Migración no trivial: ampliar los enums de estado y de evento en la base, dropear la columna de bloqueo, eliminar el use-case y la ruta HTTP de cambio manual. Requiere coordinación con el paquete de UI (regen kubb, ajuste de constantes y vistas).

## Relacionados

- `relacionado-con` → [../structure/layers-and-dependencies.md](../structure/layers-and-dependencies.md) — la política de transición vive en la capa de dominio.
- `relacionado-con` → [../structure/inter-layer-communication.md](../structure/inter-layer-communication.md) — el estado se propaga vía DTOs de borde, no exponiendo el agregado.
- `relacionado-con` → [../data/data-modeling.md](../data/data-modeling.md) — enums de estado/evento y registro de cambios de estado en la base.
