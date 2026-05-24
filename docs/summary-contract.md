# Summary Contract — Vistas y Componentes de la UI

Documento de contexto para la construcción del frontend. Resume qué expone la API y qué vistas/componentes se desprenden de ella. No es especificación de implementación; sirve para ubicar el trabajo cuando se arranque la UI.

---

## Contexto de la API

- **Stack**: Hono + Bun, OpenAPI 3.0, Zod, Drizzle ORM, PostgreSQL.
- **Auth**: cookie `session` (JWT httpOnly). `POST /auth/login` es el único endpoint público; todo lo demás requiere sesión. No hay roles ni permisos: cualquier usuario autenticado puede todo.
- **Paginación**: envelope uniforme en todos los listados → `{ items, total, limit, offset }`. Params via `pagination[limit]` / `pagination[offset]` (limit 1–100, default 20).
- **Errores**: respuestas `application/problem+json`.

### Endpoints

```
POST   /auth/login                    (público)
POST   /auth/logout

POST   /contacts
GET    /contacts                      (filtros + search + paginación)
GET    /contacts/:id
POST   /contacts/:id/events           (puede disparar cambio de estado automático)
GET    /contacts/:id/events           (paginación)
GET    /contacts/:id/state-changes    (paginación)
PATCH  /contacts/:id/state            (cambio manual → stateLocked = true)
DELETE /contacts/:id                  (soft-delete)

POST   /users
GET    /users                         (solo paginación)
GET    /users/:id
PATCH  /users/:id                     (nombre y/o password)
DELETE /users/:id                     (soft-delete)
```

### Enums de dominio

- **PipelineState**: `Contact → Lead → Customer → Discarded`
- **EventType**: `FirstContact`, `MessageSent`, `ResponseReceived`, `MeetingCall`, `ProposalSent`, `ProposalWon`, `ProposalRejected`, `FollowUpPending`, `Note`
- **SourceChannel**: `Instagram`, `WhatsApp`, `Referral`, `Email`, `Other`
- **InterestLevel**: `Cold`, `Warm`, `Hot`

### Lógica de pipeline relevante para la UI

- Ciertos eventos avanzan el estado automáticamente (solo hacia adelante, nunca retroceden):
  - `ResponseReceived`, `MeetingCall`, `ProposalSent` → `Lead`
  - `ProposalWon` → `Customer`
- El cambio manual de estado (`PATCH /state`) permite mover a cualquier estado (incluido `Discarded`) y marca `stateLocked = true`, lo que **bloquea futuros cambios automáticos**. La UI debe indicar este bloqueo visualmente.

---

## Vistas

### Autenticación
- **Login** — `POST /auth/login`. Setea la cookie de sesión. Logout es una acción.
- **Route guard** — protege todo lo que no sea login.

### Contacts (núcleo del CRM)
- **Listado de contactos (modo dual)** — `GET /contacts`. Vista principal con toggle **Tabla ↔ Kanban**, ambos modos alimentados por la misma query. Filtros y search son compartidos entre modos.
  - **Modo Tabla** — listado denso, columnas, paginación clásica. Para filtrado fino y trabajo masivo.
  - **Modo Kanban** — columnas por `pipelineState` (Contact / Lead / Customer / Discarded). Drag entre columnas dispara `PATCH /contacts/:id/state` (→ `stateLocked`).
- **Detalle de contacto** — `GET /contacts/:id`. Concentra:
  - Datos del contacto + badges de estado.
  - **Timeline de eventos** — `GET /contacts/:id/events` + registrar evento (`POST .../events`).
  - **Historial de estados** — `GET /contacts/:id/state-changes`.
  - **Cambio manual de estado** — `PATCH /contacts/:id/state`.
- **Alta de contacto** — formulario (`POST /contacts`). No hay PATCH de datos generales, solo de estado.

### Users (administración)
- **Listado de usuarios** — `GET /users` (solo paginación, sin filtros).
- **Alta / edición de usuario** — `POST /users`, `PATCH /users/:id` (nombre y/o password).

### Shell
- **Layout autenticado** con navegación (Contacts / Users) y logout.

---

## Componentes transversales

- **DataTable paginada** — consume el envelope `{ items, total, limit, offset }`. Reutilizable en contacts y users.
- **ViewToggle** — alterna Tabla/Kanban y persiste la preferencia (local).
- **FilterBar / SearchBar** — específicos de contacts; mapean la sintaxis `filter[field][op]=value` y el `search`. Compartidos por ambos modos.
- **KanbanBoard → KanbanColumn → ContactCard** — modo Kanban. La card reusa los badges.
- **Badges de dominio**: pipelineState, interestLevel, sourceChannel, e indicador de `stateLocked`.
- **Timeline de eventos** — ítems tipados por `eventType` (9 tipos), con autor y `occurredAt`.
- **Formularios** — login, contacto, usuario, registrar evento, cambiar estado.
- **Diálogos** — crear/editar, confirmar borrado (soft-delete), registrar evento, cambiar estado.
- **Estados de UI** — loading, empty, error (`application/problem+json`).

---

## Decisiones y consideraciones abiertas

### Vista de contactos: Tabla + Kanban combinadas (decidido)
Una sola vista de listado con toggle entre ambos modos, compartiendo filtros y search.

### Paginación del Kanban (a resolver en construcción)
El API pagina **global**, pero el Kanban agrupa **por columna**. Dos enfoques:

- **A)** Una query y agrupar `items` en cliente por `pipelineState`. Simple, pero la paginación global no encaja con columnas que crecen distinto.
- **B)** Una query por columna con `filter[pipelineState][eq]=<estado>` y paginación independiente por columna. Más llamadas, pero es lo natural en Kanban. El API ya lo soporta.

Decisión a tomar en la fase de construcción.
