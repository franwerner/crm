# ADR 16 — Ordenamiento server-side en endpoints de listado

- **Status:** Accepted
- **Fecha de creación:** 2026-05-24
- **Última actualización:** 2026-05-24
- **Decisores:** ifran
- **Fase del bootstrap:** extensión transversal

## Contexto

Los endpoints de listado necesitan ordenamiento server-side controlado por el cliente. El orden estaba hardcodeado por recurso (ej. `createdAt DESC` en contactos). Exponer ordenamiento arbitrario por cualquier columna es un riesgo de seguridad (enumeration, timing attacks) y de performance (columnas sin índice). Se necesita un mecanismo genérico, reutilizable por todos los recursos, con whitelist por recurso.

## Decisión

### Wire format

Un solo parámetro de query string: `sort=campo:dir`.

```
GET /contacts?sort=name:asc
GET /contacts?sort=createdAt:desc
```

- Un único criterio de ordenamiento (single-column). Multi-columna queda fuera del alcance actual.
- `dir ∈ {asc, desc}`. Cualquier otro valor es `ValidationError` (400).
- Si `sort` no se envía, el recurso aplica su propio default. Para contactos: `createdAt DESC`.

### Whitelist por recurso

Cada recurso declara los campos ordenables que expone. Un campo no declarado en la whitelist lanza `ValidationError` (400) aunque exista en la tabla.

La whitelist para `contacts`:

```ts
['name', 'phone', 'pipelineState', 'sourceChannel', 'interestLevel', 'createdAt']
```

### Módulos afectados

| Módulo | Capa | Cambio |
|---|---|---|
| `src/shared/types/sort.ts` | Shared types | Tipos `SortDir` y `Sort` (nuevo archivo) |
| `src/shared/types/filters.ts` | Shared types | `ListQuery` importa `Sort` y agrega `sort?: Sort` |
| `src/shared/db/list-query-schema.ts` | Shared DB | `buildListQuerySchema` acepta `sortableFields: readonly string[]`; parsea y valida `sort=campo:dir` en el transform |
| `src/modules/contacts/infrastructure/contact.resource.ts` | Infrastructure | Declara `contactSortableFields` y pasa la whitelist a `buildListQuerySchema` |
| `src/modules/contacts/infrastructure/contact.repository.bun.ts` | Infrastructure | `findMany` aplica `orderBy` dinámico vía `contactColumnMap[field]`; fallback a `createdAt DESC` |

### Validación

El parseo de `sort` ocurre en la capa Zod (`buildListQuerySchema`), antes de llegar al repositorio. Errores lanzan `ValidationError` (400, `code: validation_failed`), coherente con ADR 04.

### Default por recurso

Cada recurso define su propio fallback de ordenamiento en el repositorio. No existe un default global. El repositorio aplica el fallback cuando `query.sort` es `undefined`.

## Alternativas consideradas

- **Multi-columna (`sort[]=name:asc&sort[]=createdAt:desc`):** más flexible pero innecesario para el CRM actual. Se puede extender el formato sin romper compatibilidad cuando haya un caso de uso real.
- **Sort en query string separado por campo y dirección (`sort_field=name&sort_dir=asc`):** dos parámetros acoplados semánticamente; más verboso sin ventaja.
- **Whitelist global (misma para todos los recursos):** no aplica — cada recurso tiene su modelo de datos y sus índices. Whitelist por recurso es la única opción segura.

## Consecuencias

**Positivas:**
- Ordenamiento server-side; nunca en memoria.
- Whitelist por recurso previene enumeración de columnas y queries sobre columnas sin índice.
- Genérico: cualquier recurso que use `buildListQuerySchema` adopta el mecanismo pasando su whitelist.
- Formato `campo:dir` es compacto y predecible.

**Negativas / trade-offs:**
- Un solo criterio de ordenamiento; si aparece un caso de multi-columna hay que extender el formato (backward compatible con lista).
- La whitelist es estática en código; cambiarla requiere un deploy.

## Reglas concretas

- El parámetro se llama siempre `sort` en el query string.
- El formato es siempre `campo:dir` (un único colon como separador).
- Direcciones válidas: `asc`, `desc`. Cualquier otra: `ValidationError`.
- Campo no en whitelist: `ValidationError`.
- El fallback de orden (cuando no hay `sort`) se define en el repositorio, no en la capa compartida.
- La whitelist se pasa como tercer argumento a `buildListQuerySchema`; omitirlo o pasar array vacío implica que el recurso no admite ordenamiento y cualquier `sort` es inválido.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-24 | Decisión inicial. Wire format `campo:dir`; single-column; whitelist por recurso; validación en capa Zod; fallback por recurso en repositorio | ifran |
