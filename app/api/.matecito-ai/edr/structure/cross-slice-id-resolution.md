# EDR — Resolución de IDs cross-slice por filtro (enrichment → contacts)

- **Status:** Accepted
- **Type:** convention
- **Date:** 2026-06-17

## Contexto

Se agregó el enriquecimiento **batch por filtro**: desde la lista de contactos, el usuario puede pedir "analizar los N contactos filtrados" mandando los grupos de filtro activos del query builder (no los IDs paginados visibles). El módulo `enrichment` necesita entonces **resolver el conjunto de IDs de contacto** que matchean esos filtros para encolar un insight por cada uno, respetando los mismos filtros y caps que la lista de `contacts`.

`enrichment` ya leía datos de `contacts` con un read-port propio (carga los datos de un contacto para armar el prompt) sin importar `@modules/contacts` (`layers-and-dependencies.md` → "Colaboración cross-slice"). Esta es la **segunda** lectura cross-slice de `contacts` desde `enrichment`, y la primera que reusa la **gramática de filtros** de listados fuera del slice que la definió. Hacía falta registrar explícitamente este segundo consumo y el acoplamiento que introduce, porque el gate de dependency-cruiser **queda ciego** al acoplamiento que viaja por el schema compartido.

## Decisión

`enrichment` resuelve los IDs de contacto por filtro reutilizando el patrón de read-port cross-slice ya establecido — **no se introduce un mecanismo nuevo**, es el patrón existente aplicado a la resolución de IDs por filtro.

1. **Operación de read-port que resuelve por filtro.** El read-port del consumidor gana una operación que recibe los grupos de filtro (+ búsqueda opcional) y devuelve **solo IDs** (read model mínimo), no entidades de contacts. Los tipos de filtro vienen de `@shared/types` (permitido por la regla del read-port: puede importar `src/shared/**`).
2. **Adapter sobre el schema compartido.** El adapter hace un `SELECT` de IDs combinando en el `WHERE`: el predicado de **soft-delete**, los grupos de filtro y la búsqueda. Reusa los helpers de la gramática DNF de listados y obtiene las columnas del schema compartido **localmente** — NO importa nada de `@modules/contacts`.
3. **Reuso del wire format de filtros.** El endpoint de batch acepta una unión discriminada: el caso de IDs explícitos (actual) y el caso de filtro. El schema de filtro **reusa** la gramática DNF de `contacts` (mismo wire parseado a grupos de filtro), no se inventa un formato propio. Los caps `MAX_OR_GROUPS` / `MAX_CONDITIONS_PER_GROUP` siguen aplicando.
4. **El use-case consume el read-port, no el repo de contacts.** El use-case de encolado gana la rama de filtro: resuelve los IDs por el read-port y encola el batch con los IDs resueltos, respetando `ENRICHMENT_BATCH_MAX` y la dedup por template. El composition root del slice instancia el adapter con la DB.
5. **Se registra el acoplamiento explícitamente.** Este EDR existe **porque** el acoplamiento de `enrichment` a la forma de la tabla de `contacts` (las columnas filtrables, el invariante soft-delete, la semántica de la gramática DNF) viaja por el schema compartido y dependency-cruiser **no lo detecta**. Documentarlo es la mitigación: el segundo consumo cross-slice de `contacts` queda trazado, no implícito.

## Alcance

- `src/modules/enrichment/application/*.query.ts` — read-port del consumidor (`findById` de detalle + resolución de IDs por filtro).
- `src/modules/enrichment/infrastructure/*.query.drizzle.ts` — adapter que lee `contacts` del schema compartido sin importar `@modules/contacts`.
- `src/modules/enrichment/application/use-cases/*-enqueue.use-case.ts` — rama de filtro → resolución de IDs → enqueue batch.

## Reglas verificables

- **[tool: dependency-cruiser]** (`adr02-5-slices-isolated`) PROHIBIDO importar `@modules/contacts` desde `enrichment`; las columnas se obtienen del schema compartido localmente.
- **[manual]** el `SELECT` de IDs incluye el predicado de soft-delete; nunca resolver contactos borrados.
- **[manual]** el filtro del batch reusa la gramática DNF de listados; no inventar un formato propio. Aplican `MAX_OR_GROUPS` / `MAX_CONDITIONS_PER_GROUP`.
- **[manual]** el use-case depende del read-port, no del repository de contacts; respeta `ENRICHMENT_BATCH_MAX` y la dedup por template.
- **[manual]** todo nuevo consumo cross-slice de `contacts` (o de un tercer módulo) se registra: el gate no lo detecta.

## Alternativas consideradas

- **Resolver IDs en el frontend y mandar la lista de IDs** — descartado: el front solo tiene la página visible; "analizar los N filtrados" requiere el conjunto completo que matchea el filtro, que solo el backend puede resolver. Mandar IDs paginados resolvería un subconjunto incorrecto.
- **Importar `@modules/contacts` desde `enrichment`** — descartado: viola el aislamiento de slices sin excepción. La colaboración cross-módulo es lectura directa por read-port del consumidor, no import cross-slice.
- **Publicar un contrato/servicio de resolución desde `contacts`** (API pública por módulo) — descartado: ese patrón fue eliminado en `layers-and-dependencies.md`. El consumidor lee lo que necesita del schema compartido.
- **Inventar un wire format de filtro propio para el batch** — descartado: duplicaría la gramática DNF y abriría drift entre el filtro de la lista y el del batch. Reusar la gramática garantiza que "los filtrados" signifique lo mismo en ambos lados.
- **Extender `layers-and-dependencies.md` con una nota en vez de un EDR propio** — descartado: el acoplamiento a la forma de `contacts` (segundo consumo + reuso de la gramática entre módulos) merece un registro propio y trazable.

## Consecuencias

**Positivas:**
- "Analizar los N filtrados" resuelve el conjunto correcto server-side, consistente con la lista de contacts (mismos filtros, mismo soft-delete, mismos caps).
- Cero import cross-slice: se mantiene el aislamiento; el patrón de read-port se reutiliza sin mecanismo nuevo.
- El wire format de filtros es uno solo (la gramática DNF de listados), sin duplicación entre módulos.
- El acoplamiento queda documentado y trazado.

**Negativas / trade-offs:**
- `enrichment` queda acoplado a la **forma de la tabla de `contacts`** (columnas filtrables, invariante soft-delete) y a la semántica de la gramática DNF, **sin contrato que lo proteja**: si `contacts` renombra una columna o cambia su soft-delete, el adapter puede romper en runtime y dependency-cruiser **no lo avisa**. Mitigación: review + este EDR.
- La gramática de filtros ahora tiene **dos consumidores**; un cambio en la gramática debe contemplar ambos.
- Duplicación parcial del armado del `WHERE` (soft-delete + filtros + búsqueda) ya presente en la lista de contacts, ahora replicada en el resolver de IDs.

## Relacionados

- `depende-de` → [layers-and-dependencies.md](layers-and-dependencies.md) — patrón de read-port cross-slice y regla de aislamiento.
- `relacionado-con` → [read-models-for-lists.md](read-models-for-lists.md) — los read-ports cubren lecturas cross-módulo.
- `relacionado-con` → [../contracts/filter-grammar.md](../contracts/filter-grammar.md) — gramática DNF de filtros reusada por ambos consumidores.
