# ADR 17 — Read models para listas (CQRS-lite)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-24
- **Última actualización:** 2026-05-26 (extensión: los read-ports también cubren lecturas cross-módulo y de detalle, no solo listas del propio slice)
- **Decisores:** ifran
- **Fase del bootstrap:** extensión transversal

## Contexto

Los endpoints de listado devolvían el agregado de dominio completo reconstituido desde la base de datos. Para la lista de contacts, esto implica cargar events y stateChanges aunque no se usen, no poder hacer JOINs a tablas relacionadas (ej. el user creador), y mezclar lógica de lectura en el repository del dominio. A medida que los listados necesitan proyecciones enriquecidas (ej. `creator: { id, name }`), el repository de escritura se convierte en el lugar incorrecto para esas queries.

El diseño CQRS-lite (sin event sourcing, sin buses) separa los paths de lectura y escritura dentro del slice, manteniendo el mismo proceso y la misma base de datos.

## Decisión

Los listados devuelven una **proyección de lectura (read model)**, no el agregado de dominio. Los reads de detalle (get por id) del PROPIO agregado y las escrituras siguen usando el repository de dominio; las lecturas de **otro módulo** (lista o detalle) usan un read-port (ver §Lecturas cross-módulo).

### Estructura por slice

- **Read port**: `src/modules/<slice>/application/<entity>.query.ts`
  - Interfaces de read model (`<Entity>ListItem`, `<Entity>CreatorRef`, etc.)
  - Interface del port de lectura (`<Entity>Queries`) con un método por query de lista — un solo port "gordo" por slice
  - Interface de input de la query (`<Entity>ListInput extends ListQuery`)
  - Sin imports de Hono, infrastructure, ni http

- **Read adapter**: `src/modules/<slice>/infrastructure/<entity>.query.drizzle.ts`
  - Implementa el port de lectura
  - Puede hacer JOINs y proyecciones arbitrarias
  - Devuelve `Page<XxxListItem>` directamente del SELECT, sin reconstituir el agregado
  - Sigue las mismas reglas de DB que los repository adapters (ADR 02 #4 y #7)

- **Use-case de lista**: `application/use-cases/<entity>-list.use-case.ts`
  - Depende del port de lectura (`<Entity>Queries`), no del `<Entity>Repository`
  - Signature: `execute(input: <Entity>ListInput): Promise<Page<<Entity>ListItem>>`

### Lecturas cross-módulo (extensión 2026-05-26)

Los read-ports también son el mecanismo de **colaboración cross-módulo de lectura** (ADR 02, §"Colaboración cross-slice"), no solo de proyecciones de lista del propio slice. Cuando un slice necesita datos de otro módulo:

- El consumidor define un read-port `application/<x>.query.ts` con SOLO las lecturas y los campos que necesita.
- El adapter `infrastructure/<x>.query.drizzle.ts` lee directo las tablas de otro módulo del schema compartido `@shared/db`.

Aplica tanto a listas como a **reads de detalle** (ej. auth obteniendo credenciales/perfil de `users` por email o id). Esta extensión reemplaza al patrón de API pública por módulo eliminado en ADR 02 (Historial 2026-05-26).

### Escalado del read port

- Un port "gordo" por slice (`ContactQueries`) con todos los métodos de lista del slice. Cuando los métodos sean muchos, se evalúa partir por concepto.
- Read models inline en `<entity>.query.ts` mientras sean pocos. Cuando crezcan, se extraen a `application/read-models/` (sin trigger definido aún — decisión cuando el archivo supere ~100 líneas o haya >3 interfaces).

### Enforcement

- Regla `adr02-2b-read-port` en `.dependency-cruiser.js`: los archivos `application/*.query.ts` solo pueden importar su propio `domain/` y `src/shared/**`. Nunca Hono, infrastructure ni http.
- Los archivos `*.query.drizzle.ts` se incorporan a las reglas `adr02-4-db-only-in-adapter` (pueden importar `shared/db`) y `adr02-7-only-root-wires-adapters` (solo `bootstrap.ts` y `app.ts` los instancian).

## Alternativas consideradas

- **Mantener el agregado en la lista**: simple, pero impide JOINs necesarios y mezcla concerns de escritura y lectura en el repository de dominio. Descartado al aparecer el primer caso de dato relacionado (creator).
- **CQRS con event sourcing / buses**: sobredimensionado para un CRM monolítico en esta etapa. Descartado.
- **Enriquecer el repository de dominio con JOIN opcional**: el port de dominio se contaminaría con preocupaciones de presentación. Descartado.
- **GraphQL / DataLoader**: fuera del scope del stack actual (ADR 01). No evaluado.

## Consecuencias

**Positivas:**
- Los listados pueden proyectar exactamente los campos necesarios y hacer JOINs sin contaminar el agregado de dominio.
- El repository de dominio queda limpio para escrituras y reads de detalle.
- El read port es testeable en aislamiento del adapter.

**Negativas / trade-offs:**
- Un archivo extra por slice que agrega listado (`*.query.ts` + `*.query.drizzle.ts`).
- Duplicación parcial: el WHERE y el sort de la lista se replican en el query adapter (antes estaban en el repository adapter).
- La lista de users todavía usa el repository de dominio para `findMany` — queda pendiente de retrofit para consistencia. Deferido a conciencia: el cambio es mecánico y puede hacerse sin impacto de diseño cuando sea conveniente.

## Reglas concretas

- Los listados de recursos usan `<Entity>Queries` (port de lectura) como dependencia, no `<Entity>Repository`.
- Los read models no exponen el agregado: son interfaces planas con los campos proyectados.
- `<entity>.query.ts` vive en `application/` (no en `domain/`): es una preocupación de la capa de aplicación, no del dominio.
- El read adapter vive en `infrastructure/` con sufijo `.query.drizzle.ts`.
- `bootstrap.ts` instancia tanto el repository adapter como el query adapter para el mismo slice.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-24 | Decisión inicial. CQRS-lite para listados: read port en application, adapter Drizzle en infrastructure. Aplicado a contacts list. Users list pendiente de retrofit. | ifran |
| 2026-05-26 | **Extensión a lecturas cross-módulo.** Los read-ports (`application/*.query.ts` + `infrastructure/*.query.drizzle.ts`) pasan a ser también el mecanismo de colaboración cross-módulo de lectura, no solo proyecciones de lista del propio slice — reemplaza al patrón de API pública por módulo (ver ADR 02, Historial 2026-05-26). Cubre listas y reads de detalle de otro módulo (ej. auth leyendo users). | ifran |
