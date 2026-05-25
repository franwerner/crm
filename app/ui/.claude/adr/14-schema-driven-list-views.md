# ADR 14 — Schema-driven list views (metadata-driven UI)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-24
- **Última actualización:** 2026-05-24
- **Decisores:** ifran
- **Fase del bootstrap:** Update — decisión nueva (relacionada a 5.7 / ADR 11, 13)

## Contexto

El shape de cada entidad (qué campos tiene y de qué tipo) está hoy duplicado en varios puntos. En `app/ui` concretamente:

- `ContactRow` + `contactColumns` (`features/contacts/components/contacts-columns.tsx`)
- `contactsFilterSchema` (`features/contacts/contacts-filter-schema.ts`)
- `contactsSortFieldEnum` (`app/router.tsx`)
- labels, badge variants y formato de celda dispersos en cada columna

Cada campo nuevo (ej. `updatedAt`) obliga a editar varios de esos lugares y es fácil que queden desincronizados. Al mismo tiempo, el contrato OpenAPI ya describe el shape y kubb ya genera los tipos (`ContactView`) que se consumen en build-time (ADR 09). Lo que falta es unificar la capa de **presentación** de las vistas de listado (tabla, filtros, sort, search) en una sola fuente por entidad, sin volver a declarar el shape.

## Decisión

1. La fuente de verdad del **shape** de cada entidad es el tipo generado por kubb a partir del OpenAPI (ej. `ContactView`) — ADR 09. No se duplica el shape ni se crea un endpoint de metadata en runtime.
2. El frontend agrega una capa de **presentación** en un *entity descriptor* genérico `EntityDescriptor<T>`, **tipado contra el tipo generado**. Si el contrato cambia (se agrega/quita/renombra un campo), `tsc` rompe el descriptor en compilación.
3. Del descriptor se derivan, en build-time: las columnas de la tabla, el filter schema, los sort fields del front y la presentación del search (placeholder y visibilidad).
4. El sistema es **genérico y multi-entidad** desde el arranque (Contacts, Users y futuras), no específico de una entidad.
5. **No** se mete presentación (labels, options con label, formato, badge variants) en el backend. Se respeta la separación contrato/presentación de los ADR 09 y 13: el backend expone el contrato; la presentación es autónoma del front.
6. Las *capabilities* server-side (sobre qué columnas busca el `search`, qué ops valida el filter, qué campos son sortable) se siguen derivando en el backend a partir de `getTableColumns` (ya aplicado: `contactSortableFields = Object.keys(contactColumnMap)`). El front no es fuente de verdad de esas capabilities: manda `search`/`filter`/`sort` y el backend valida.

## Alternativas consideradas

- **Endpoint de metadata runtime** (server-driven UI metadata) — descartado: duplicaría lo que el OpenAPI ya describe, haría perder el tipado build-time que da kubb, y obligaría a meter presentación en el backend o a mantener una doble fuente. Solo se justificaría con campos dinámicos definidos por el usuario en runtime, que no es el caso (shape estático en código).
- **Presentación en el backend** (labels/options vía OpenAPI `x-*`) — descartado: rompe la separación contrato/presentación (ADR 09/13).
- **Descriptor no tipado contra el contrato** (objeto manual independiente) — descartado: vuelve a abrir la puerta a la desincronización silenciosa que este ADR busca cerrar.
- **Status quo** (definiciones manuales duplicadas por entidad) — descartado: es el problema que motiva este ADR.

## Consecuencias

**Positivas:**
- Una sola fuente de presentación por entidad; agregar un campo se concentra en el descriptor.
- Sincronización shape↔presentación verificada por el compilador.
- Patrón reutilizable para todas las entidades de listado.

**Negativas / trade-offs:**
- Capa de indirección y abstracción genérica nueva que hay que entender y mantener.
- Riesgo de over-engineering si se fuerza a casos que no son listados estándar; el descriptor cubre vistas de listado, no toda UI.

## Reglas concretas

- **Motor genérico** (agnóstico de dominio) en `shared/lib/data-view/`: tipos `EntityDescriptor<T>` / `FieldDescriptor`, y los derivadores `toColumns` / `toFilterSchema` / `toSortFields` / `toSearchPresentation`.
- **Tabla genérica**: se reutiliza la `DataTable` existente en `shared/ui/data-table.tsx` (no se duplica).
- **Descriptor por entidad** (sabe de dominio: labels en español, options con label, badge variants, formato) en `features/<f>/<f>.descriptor.ts`. Por ADR 11, lo que "sabe" de dominio va en `features/`, no en `shared/`.
- El descriptor se **tipa contra el tipo generado por kubb** (`EntityDescriptor<ContactView>`); no se redeclara el shape.
- El backend **no** recibe metadata de presentación. Las capabilities server-side se derivan de `getTableColumns` (ver `contact.resource.ts`).
- Para derivar del contrato sin duplicar (tipos de dominio, schema del form, options), las features importan `shared/api` desde cualquier capa. Esto requirió **relajar las reglas #3/#4/#5 del ADR 02** (2026-05-24): se resigna el anti-corruption layer estricto a cambio de eliminar duplicación. `shared/ui` sigue puro. Sincronizado en `eslint.config.js` y `.dependency-cruiser.cjs`.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-24 | Decisión inicial | ifran |
| 2026-05-24 | Se relajan reglas #3/#4/#5 del ADR 02 para permitir que las features deriven del contrato (`shared/api`) sin duplicar tipos/schemas | ifran |
