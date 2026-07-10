# EDR — Read models para listas (CQRS-lite)

- **Status:** Accepted
- **Type:** decision
- **Date:** 2026-05-24

## Contexto

Los endpoints de listado devolvían el agregado de dominio completo reconstituido desde la base de datos. Para una lista, esto implica cargar sub-colecciones aunque no se usen, no poder hacer JOINs a tablas relacionadas (ej. el usuario creador), y mezclar lógica de lectura en el repository del dominio. A medida que los listados necesitan proyecciones enriquecidas (datos relacionados), el repository de escritura se convierte en el lugar incorrecto para esas queries.

El diseño CQRS-lite (sin event sourcing, sin buses) separa los paths de lectura y escritura dentro del slice, manteniendo el mismo proceso y la misma base de datos.

## Decisión

Los listados devuelven una **proyección de lectura (read model)**, no el agregado de dominio. Los reads de detalle (get por id) del PROPIO agregado y las escrituras siguen usando el repository de dominio; las lecturas de **otro módulo** (lista o detalle) usan un read-port.

**Estructura por slice:**
- **Read port** (capa de aplicación): interfaces de read model (planas), la interface del port de lectura con un método por query de lista (un solo port "gordo" por slice), y la interface de input de la query. Sin imports del framework HTTP, infrastructure ni http.
- **Read adapter** (capa de infraestructura): implementa el port de lectura, puede hacer JOINs y proyecciones arbitrarias, devuelve `Page<ReadModel>` directo del SELECT sin reconstituir el agregado. Sigue las mismas reglas de DB que los repository adapters.
- **Use-case de lista:** depende del port de lectura, no del repository de dominio.

**Lecturas cross-módulo.** Los read-ports también son el mecanismo de **colaboración cross-módulo de lectura** (`layers-and-dependencies.md`), no solo de proyecciones de lista del propio slice. Cuando un slice necesita datos de otro módulo, el consumidor define un read-port con SOLO las lecturas y campos que necesita, y su adapter lee directo las tablas del otro módulo del schema compartido. Aplica tanto a listas como a reads de detalle (ej. obtener credenciales/perfil de otro módulo por email o id).

**Escalado del read port:** un port "gordo" por slice con todos los métodos de lista; se evalúa partir por concepto cuando sean muchos. Read models inline mientras sean pocos; se extraen a una carpeta propia cuando el archivo crezca (sin trigger fijo aún — orientativamente >~100 líneas o >3 interfaces).

## Alcance

- `src/modules/*/application/*.query.ts` — read-port (read models planos + interface de lectura).
- `src/modules/*/infrastructure/*.query.drizzle.ts` — read adapter (JOINs/proyecciones, lee `@shared/db`).
- `src/modules/*/application/use-cases/*-list.use-case.ts` — use-case de lista que depende del read-port.

## Reglas verificables

- **[tool: dependency-cruiser]** (`adr02-2b-read-port`) los archivos `application/*.query.ts` solo importan su propio `domain/` y `src/shared/**`; nunca el framework HTTP, infrastructure ni http.
- **[tool: dependency-cruiser]** (`adr02-4-db-only-in-adapter`) los `*.query.drizzle.ts` pueden importar `shared/db`.
- **[tool: dependency-cruiser]** (`adr02-7-only-root-wires-adapters`) solo el composition-root del slice y el global instancian los `*.query.drizzle.ts`.
- **[manual]** los read models son interfaces planas: no exponen el agregado de dominio.
- **[manual]** el read-port vive en `application/` (no en `domain/`): es una preocupación de la capa de aplicación, no del dominio.

## Alternativas consideradas

- **Mantener el agregado en la lista** — descartado al aparecer el primer caso de dato relacionado: impide JOINs necesarios y mezcla concerns de escritura y lectura en el repository de dominio.
- **CQRS con event sourcing / buses** — descartado: sobredimensionado para un CRM monolítico en esta etapa.
- **Enriquecer el repository de dominio con JOIN opcional** — descartado: el port de dominio se contaminaría con preocupaciones de presentación.
- **GraphQL / DataLoader** — fuera del scope del stack actual; no evaluado.

## Consecuencias

**Positivas:**
- Los listados pueden proyectar exactamente los campos necesarios y hacer JOINs sin contaminar el agregado de dominio.
- El repository de dominio queda limpio para escrituras y reads de detalle.
- El read port es testeable en aislamiento del adapter.

**Negativas / trade-offs:**
- Un archivo extra por slice que agrega listado (read-port + read adapter).
- Duplicación parcial: el WHERE y el sort de la lista se replican en el query adapter (antes estaban en el repository adapter).
- Algún slice todavía usa el repository de dominio para su listado; queda pendiente de retrofit para consistencia. Diferido a conciencia: el cambio es mecánico y sin impacto de diseño.

## Relacionados

- `depende-de` → [layers-and-dependencies.md](layers-and-dependencies.md) — los read-ports son el mecanismo de colaboración cross-slice.
- `relacionado-con` → [inter-layer-communication.md](inter-layer-communication.md) — read models planos, no entidades, cruzan el borde.
- `relacionado-con` → [cross-slice-id-resolution.md](cross-slice-id-resolution.md) — aplica el read-port a la resolución de IDs por filtro.
