# EDR — Ordenamiento server-side en endpoints de listado

- **Status:** Accepted
- **Type:** convention
- **Date:** 2026-05-24

## Contexto

Los endpoints de listado necesitan ordenamiento server-side controlado por el cliente. El orden estaba hardcodeado por recurso (ej.: contactos por fecha de creación descendente). Exponer ordenamiento arbitrario por cualquier columna es un riesgo de seguridad (enumeration, timing attacks) y de performance (columnas sin índice). Se necesita un mecanismo genérico, reutilizable por todos los recursos, con whitelist por recurso.

## Decisión

### Wire format

Un solo parámetro de query string: `sort=campo:dir`.

```
GET /contacts?sort=name:asc
GET /contacts?sort=createdAt:desc
```

- Un único criterio de ordenamiento (single-column). Multi-columna queda fuera del alcance actual.
- `dir ∈ {asc, desc}`. Cualquier otro valor es `ValidationError` (400).
- Si `sort` no se envía, el recurso aplica su propio default. Para contactos: por fecha de creación descendente.

### Whitelist por recurso

Cada recurso declara los campos ordenables que expone. Un campo no declarado en la whitelist lanza `ValidationError` (400) aunque exista en la tabla. La whitelist de `contacts` expone: `name`, `phone`, `pipelineState`, `sourceChannel`, `interestLevel`, `createdAt`.

### Validación

El parseo y la validación de `sort` ocurren en la capa Zod, antes de llegar al repositorio. Los errores lanzan `ValidationError` (400, `code: validation_failed`), coherente con la política de manejo de errores.

### Default por recurso

Cada recurso define su propio fallback de ordenamiento en su repositorio. No existe un default global; el repositorio aplica el fallback cuando no llega `sort`.

## Reglas verificables

- **[manual]** El parámetro se llama siempre `sort` en el query string; el formato es siempre `campo:dir` (un único colon como separador).
- **[manual]** Direcciones válidas: `asc`, `desc`. Cualquier otra → `ValidationError`.
- **[manual]** Un campo no presente en la whitelist del recurso → `ValidationError`, aunque exista en la tabla.
- **[manual]** El parseo de `sort` ocurre en la capa Zod (`buildListQuerySchema`), antes del repositorio.
- **[manual]** El fallback de orden (cuando no hay `sort`) se define en el repositorio del recurso, no en la capa compartida.
- **[manual]** La whitelist de campos ordenables se pasa a `buildListQuerySchema`; omitirla o pasar array vacío implica que el recurso no admite ordenamiento y cualquier `sort` es inválido.

## Alternativas consideradas

- **Multi-columna** (`sort[]=name:asc&sort[]=createdAt:desc`): más flexible pero innecesario para el CRM actual. Se puede extender el formato sin romper compatibilidad cuando haya un caso real.
- **Sort en dos parámetros** (`sort_field=name&sort_dir=asc`): dos parámetros acoplados semánticamente, más verboso sin ventaja.
- **Whitelist global** (misma para todos los recursos): no aplica — cada recurso tiene su modelo de datos y sus índices. La whitelist por recurso es la única opción segura.

## Consecuencias

**Positivas:**
- Ordenamiento server-side; nunca en memoria.
- La whitelist por recurso previene enumeración de columnas y queries sobre columnas sin índice.
- Genérico: cualquier recurso que use el query builder compartido adopta el mecanismo pasando su whitelist.
- El formato `campo:dir` es compacto y predecible.

**Negativas / trade-offs:**
- Un solo criterio de ordenamiento; si aparece un caso multi-columna hay que extender el formato (backward compatible con lista).
- La whitelist es estática en código; cambiarla requiere un deploy.

## Relacionados

- `depende-de` → [api-contract.md](api-contract.md) — el parámetro `sort` se expone en el OpenAPI que consume kubb.
- `relacionado-con` → [filter-grammar.md](filter-grammar.md) — comparte el query builder de listados.
- `relacionado-con` → [../runtime/error-handling.md](../runtime/error-handling.md) — `ValidationError` (400) por sort inválido.
