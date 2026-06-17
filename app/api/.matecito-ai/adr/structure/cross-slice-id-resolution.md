# ADR — Resolución de IDs cross-slice por filtro (enrichment → contacts)

- **Status:** Accepted
- **Fecha de creación:** 2026-06-17
- **Última actualización:** 2026-06-17
- **Decisores:** ifran
- **Fase:** cross-slice-id-resolution

## Contexto

La Fase 3 agregó el enriquecimiento **batch por filtro**: desde la lista de contactos, el usuario puede pedir "analizar los N contactos filtrados" mandando los `filterGroups` activos del query builder (no los IDs paginados visibles). El módulo `enrichment` necesita entonces **resolver el conjunto de `contactId`** que matchean esos filtros para encolar un insight por cada uno, respetando los mismos filtros y caps que la lista de `contacts`.

`enrichment` ya leía datos de `contacts` en Fase 2: el read-port `ContactReadQuery.findById` (`application/ports.ts` + adapter `infrastructure/contact-read.query.drizzle.ts`) carga los datos de un contacto para armar el prompt, leyendo `@shared/db` **sin importar** `@modules/contacts` (`layers-and-dependencies.md` §"Colaboración cross-slice", regla #5). Esta es la **segunda** lectura cross-slice de la tabla `contacts` desde `enrichment`, y la primera que reusa la **gramática de filtros** de listados (`../contracts/filter-grammar.md`) fuera del slice que la definió. Hacía falta registrar explícitamente este segundo consumo y el acoplamiento que introduce, porque `layers-and-dependencies.md` ya advierte que el gate de `dependency-cruiser` **queda ciego** al acoplamiento que viaja por el schema compartido.

## Decisión

`enrichment` resuelve los `contactId` por filtro reutilizando el patrón de read-port cross-slice ya establecido — **no se introduce un mecanismo nuevo**, es el patrón existente (`layers-and-dependencies.md`) aplicado a la resolución de IDs por filtro.

1. **Operación de read-port `resolveByFilter`.** El read-port del consumidor (`application/*.query.ts` de enrichment — la misma familia que `ContactReadQuery`) gana una operación `resolveByFilter(input: ContactFilterInput): Promise<string[]>`, con `ContactFilterInput = { filterGroups: FilterGroup[]; search?: string }`. Los tipos de filtro vienen de `@shared/types/filters` (permitido por la regla `adr02-2b-read-port`: el read-port puede importar `src/shared/**`). El read-port devuelve **solo IDs** (read model mínimo), no entidades de contacts.
2. **Adapter sobre `@shared/db`.** El adapter (`infrastructure/*.query.drizzle.ts`) hace `SELECT id FROM contacts` combinando en el `WHERE`: el predicado de **soft-delete** (`isNull(contacts.deletedAt)`), `applyFilterGroups(...)` con los `filterGroups` y `applySearch(...)`. Reusa los helpers de la gramática DNF de listados y obtiene las columnas con `getTableColumns(contacts)` **localmente** — NO importa `contact.resource.ts` ni nada de `@modules/contacts` (regla #5; igual que `contact-read.query.drizzle.ts`).
3. **Reuso del wire format de filtros.** El endpoint de batch acepta una unión discriminada: `{ kind: 'ids', contactIds, templateId }` (el caso actual) | `{ kind: 'filter', filter: <grammar de listados>, templateId }`. El schema de filtro **reusa** la gramática DNF de `contacts` (mismo wire `filter[field][op]=...` parseado a `filterGroups`) — no se inventa un formato propio (`../contracts/filter-grammar.md`). Los caps `MAX_OR_GROUPS` / `MAX_CONDITIONS_PER_GROUP` siguen aplicando.
4. **El use-case consume el read-port, no el repo de contacts.** `EnrichmentEnqueueUseCase` gana la rama `filter`: llama `resolveByFilter(...)` y encola el batch con los IDs resueltos, respetando `ENRICHMENT_BATCH_MAX` y la dedup por template que ya existe en el enqueue. El composition root del slice instancia el adapter con `db`.
5. **Se registra el acoplamiento explícitamente.** Este ADR existe **porque** el acoplamiento de `enrichment` a la forma de la tabla `contacts` (las columnas filtrables, el invariante soft-delete, la semántica de la gramática DNF) viaja por `@shared/db` y la `dependency-cruiser` **no lo detecta** (`layers-and-dependencies.md` §"Colaboración cross-slice", consecuencia 2). Documentarlo es la mitigación: el segundo consumo cross-slice de `contacts` queda trazado, no implícito.

## Alternativas consideradas

- **Resolver IDs en el frontend y mandar la lista de `contactIds`** — descartado: el front solo tiene la página visible; "analizar los N filtrados" requiere el conjunto completo que matchea el filtro, que solo el backend puede resolver (es el riesgo #6 del explore). Mandar IDs paginados resolvería un subconjunto incorrecto.
- **Importar `@modules/contacts` desde `enrichment`** (reusar su query de lista) — descartado: viola la regla #5 (aislamiento de slices) sin excepción. La colaboración cross-módulo es lectura directa por read-port del consumidor, no import cross-slice.
- **Publicar un contrato/servicio de resolución desde `contacts`** (API pública por módulo) — descartado: ese patrón fue **eliminado** en `layers-and-dependencies.md` (reversión 2026-05-26). El consumidor lee lo que necesita del schema compartido.
- **Inventar un wire format de filtro propio para el batch de enrichment** — descartado: duplicaría la gramática DNF y abriría drift entre el filtro de la lista de contacts y el del batch. Reusar la gramática garantiza que "los filtrados" signifique lo mismo en ambos lados.
- **Extender `layers-and-dependencies.md` con una nota en vez de un ADR propio** — descartado: el acoplamiento a la forma de `contacts` (segundo consumo + reuso de la gramática entre módulos) merece un registro propio y trazable, no una nota perdida en el ADR de capas.

## Consecuencias

**Positivas:**
- "Analizar los N filtrados" resuelve el conjunto correcto server-side, consistente con la lista de contacts (mismos filtros, mismo soft-delete, mismos caps).
- Cero import cross-slice: se mantiene la regla #5; el patrón de read-port se reutiliza sin mecanismo nuevo.
- El wire format de filtros es uno solo (la gramática DNF de listados), sin duplicación entre módulos.
- El acoplamiento queda documentado y trazado: el segundo consumo cross-slice de `contacts` no es implícito.

**Negativas / trade-offs:**
- `enrichment` queda acoplado a la **forma de la tabla `contacts`** (columnas filtrables, invariante soft-delete) y a la semántica de la gramática DNF, **sin contrato que lo proteja**: si `contacts` renombra una columna o cambia su soft-delete, el adapter de enrichment puede romper en runtime y la `dependency-cruiser` **no lo avisa** (blind spot conocido). Mitigación: review + este ADR.
- La gramática de filtros ahora tiene **dos consumidores** (la lista de contacts y el batch de enrichment); un cambio en la gramática debe contemplar ambos.
- Duplicación parcial del armado del `WHERE` (soft-delete + filterGroups + search) ya presente en la lista de contacts, ahora replicada en el resolver de IDs de enrichment.

## Reglas concretas

- **Resolución de IDs por filtro:** vía operación `resolveByFilter(input): Promise<string[]>` del read-port del consumidor (`enrichment`), implementada en su adapter `infrastructure/*.query.drizzle.ts` que lee `@shared/db`. Devuelve solo IDs.
- **Prohibido** importar `@modules/contacts` (ni `contact.resource.ts`) desde `enrichment`: las columnas se obtienen con `getTableColumns(contacts)` localmente (regla #5 de `layers-and-dependencies.md`).
- **Soft-delete obligatorio:** el `SELECT id` incluye `isNull(contacts.deletedAt)` en el `WHERE` (`../contracts/filter-grammar.md`, invariante de soft-delete). Nunca resolver contactos borrados.
- **Wire format:** el filtro del batch reusa la gramática DNF de listados (`../contracts/filter-grammar.md`); no inventar un formato propio. Aplican `MAX_OR_GROUPS` / `MAX_CONDITIONS_PER_GROUP`.
- **El use-case** depende del read-port, no del repository de contacts; el `bootstrap.ts` del slice instancia el adapter con `db`. Respeta `ENRICHMENT_BATCH_MAX` y la dedup por template del enqueue.
- **Acoplamiento documentado:** todo nuevo consumo cross-slice de `contacts` desde `enrichment` (o un tercer módulo) se registra; el gate no lo detecta.

## Ejemplos en el código

- `app/api/src/modules/enrichment/application/ports.ts` — `ContactReadQuery` (read-port del consumidor; `findById` de Fase 2 + `resolveByFilter` de Fase 3).
- `app/api/src/modules/enrichment/infrastructure/contact-read.query.drizzle.ts` — adapter que lee `contacts`/`contact_channels` de `@shared/db` sin importar `@modules/contacts`.
- `app/api/src/modules/enrichment/application/use-cases/enrichment-enqueue.use-case.ts` — rama `filter` → `resolveByFilter` → enqueue batch.
