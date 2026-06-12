# ADR — Estándar de paginación compartido

- **Status:** Accepted (con sub-decisión cursor-based en Pending)
- **Fecha de creación:** 2026-05-19
- **Última actualización:** 2026-05-19
- **Decisores:** ifran
- **Fase:** pagination

## Contexto

Varios slices necesitan endpoints de listado paginado (contacts, events, state-changes, y cualquier feature futura). Sin un estándar compartido, cada slice inventaría su propia forma de envelope y query params, y `app/ui` (que consume el OpenAPI vía kubb, `api-contract.md`) se enfrentaría a contratos distintos feature por feature. La paginación es un contrato cross-package — no detalle interno de cada slice.

## Decisión

**Envelope único y plano** para todas las respuestas paginadas:

```ts
interface Page<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}
```

**Params de paginación**:

```ts
interface PageParams {
  limit: number
  offset: number
}
```

**Defaults y bounds**: `limit` default `20`, mínimo `1`, máximo `100`; `offset` default `0`, mínimo `0`.

**Estilo**: offset-based. Cursor-based queda Pending hasta que aparezca un caso real.

> **Sub-decisión Pending — paginación cursor-based.**
> Status: Pending. Trigger: *cuando aparezca un listado donde offset no escale (datasets grandes) o el ordenamiento haga inestable la paginación offset (ej. items nuevos llegando arriba mientras el usuario scrollea)*. En ese momento se define un envelope alternativo o coexistencia.

**Ubicación de los contratos** (split entre carpetas existentes de `shared/`):

- **Interfaces TS** (`Page<T>`, `PageParams`): `src/shared/types/pagination.ts`. Las consumen ports y use-cases del dominio sin acoplarse a HTTP.
- **Schema zod del borde y helper genérico de envelope**: `src/shared/schemas/pagination.schema.ts`, junto a `problem.schema.ts`. Es lo que reutilizan los `*.schemas.ts` de cada slice para declarar `?limit&offset` en query y construir el response paginado en OpenAPI.

## Alternativas consideradas

- **Meta anidada** (`{ items, meta: { total, limit, offset, hasMore } }`) — más extensible, pero más anidamiento para kubb y un campo (`hasMore`) que el cliente deriva trivialmente. Descartado a favor del envelope plano.
- **Plano sin echo de params** (`{ items, total }`) — el cliente no sabe en qué página está sin recordar lo que pidió. Descartado.
- **Módulo dedicado** (`src/shared/pagination/` con `pagination.ts` + `pagination.schema.ts` adentro) — más cohesivo conceptualmente, pero rompe con la separación actual de `shared` (`types/`, `schemas/`). Descartado por consistencia con la organización existente.
- **Un solo archivo** (`src/shared/pagination.ts` con interfaces + zod juntos) — mezcla nivel dominio/aplicación con borde HTTP, dificulta los chequeos de dependency-cruiser. Descartado.
- **Cursor-based desde ya** — sobredimensionado para el estado actual; queda Pending con trigger explícito.
- **Cada slice define su forma** — rompería el contrato cross-package con `app/ui`. Descartado.

## Consecuencias

**Positivas:**
- Un solo contrato visible en OpenAPI → kubb genera tipos consistentes en `app/ui`.
- Reutilización: cualquier slice nuevo importa `Page<T>` / `PageParams` y el helper de schema sin copiar forma.
- Bordes claros: la forma del envelope es shared; lo que pone adentro (`items: T[]`) lo decide cada slice.
- Defaults sensatos protegen contra request sin paginación y contra `limit` abusivos.

**Negativas / trade-offs:**
- Migración futura a cursor-based va a requerir un envelope alternativo o coexistencia (a abordar cuando dispare el Pending).
- Offset-based tiene degradación de performance en datasets muy grandes y inestabilidad de páginas si hay inserts arriba — limitaciones conocidas y aceptadas por ahora.

## Reglas concretas

- Cualquier endpoint paginado del paquete usa `Page<T>` como response shape y `PageParams` (o subtipo) como input shape del use-case.
- Los métodos de listado en repositories (`findMany`, `findEvents`, etc.) devuelven `Promise<Page<X>>`. El `total` se calcula en la misma query batch (count + select).
- `limit` y `offset` se reciben siempre por query string; la coerción a `int` y los bounds (`min 1 / max 100` para limit, `min 0` para offset) viven en `PaginationQuerySchema` (no se duplican por slice).
- El helper genérico de response (`paginatedResponseSchema(itemSchema)`) construye el envelope OpenAPI para cada slice — no se hace a mano.
- Los listados excluyen registros soft-deleted por convención del feature cuando aplique (la regla específica de soft-delete vive en el ADR del dominio relevante, no acá).
- Cursor-based: queda Pending (ver sub-decisión arriba).
