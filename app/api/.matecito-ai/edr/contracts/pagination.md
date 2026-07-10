# EDR — Estándar de paginación compartido

- **Status:** Accepted
- **Type:** convention
- **Date:** 2026-05-19

## Contexto

Varios listados del CRM necesitan endpoints paginados, y aparecerán más con cada feature nueva. Sin un estándar compartido, cada listado inventaría su propia forma de envelope y de query params, y el paquete de UI (que consume el OpenAPI vía kubb) se enfrentaría a contratos distintos feature por feature. La paginación es un contrato cross-package, no un detalle interno de cada listado.

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

**Params de paginación:**

```ts
interface PageParams {
  limit: number
  offset: number
}
```

**Defaults y bounds:** `limit` default `20`, mínimo `1`, máximo `100`; `offset` default `0`, mínimo `0`.

**Estilo:** offset-based. Cursor-based queda Pending hasta que aparezca un caso real.

> **Sub-decisión Pending — paginación cursor-based.**
> Status: Pending. Trigger: *cuando aparezca un listado donde offset no escale (datasets grandes) o el ordenamiento haga inestable la paginación offset (ej.: items nuevos llegando arriba mientras el usuario scrollea)*. En ese momento se define un envelope alternativo o coexistencia.

## Alcance

- `src/shared/types/pagination.ts` — interfaces TS del contrato (`Page<T>`, `PageParams`); las consumen ports y use-cases del dominio sin acoplarse a HTTP.
- `src/shared/schemas/pagination.schema.ts` — schema zod del borde y helper genérico de envelope; es lo que reutilizan los schemas de cada slice para declarar `?limit&offset` y construir el response paginado en OpenAPI.

## Reglas verificables

- **[manual]** Cualquier endpoint paginado usa `Page<T>` como response shape y `PageParams` (o subtipo) como input shape del use-case.
- **[manual]** Los métodos de listado en repositories devuelven `Promise<Page<T>>`; el `total` se calcula en la misma query batch (count + select).
- **[manual]** `limit` y `offset` se reciben siempre por query string; la coerción a int y los bounds (`min 1 / max 100` para limit, `min 0` para offset) viven centralizados en el schema de paginación compartido, no duplicados por slice.
- **[manual]** El helper genérico de response construye el envelope OpenAPI para cada slice; no se arma a mano.
- **[manual]** Los listados excluyen registros soft-deleted por convención del feature cuando aplique (la regla específica de soft-delete vive en el EDR del dominio relevante, no acá).

## Alternativas consideradas

- **Meta anidada** (`{ items, meta: { total, limit, offset, hasMore } }`) — más extensible, pero más anidamiento para kubb y un campo (`hasMore`) que el cliente deriva trivialmente. Descartado a favor del envelope plano.
- **Plano sin echo de params** (`{ items, total }`) — el cliente no sabe en qué página está sin recordar lo que pidió. Descartado.
- **Módulo dedicado** (una carpeta propia de paginación con tipos y schema adentro) — más cohesivo, pero rompe la separación actual de `shared` entre tipos y schemas. Descartado por consistencia con la organización existente.
- **Un solo archivo** con interfaces + zod juntos — mezcla nivel dominio/aplicación con borde HTTP y dificulta los chequeos de dependencias. Descartado.
- **Cursor-based desde ya** — sobredimensionado para el estado actual; queda Pending con trigger explícito.
- **Cada slice define su forma** — rompería el contrato cross-package con el paquete de UI. Descartado.

## Consecuencias

**Positivas:**
- Un solo contrato visible en OpenAPI → kubb genera tipos consistentes en el front.
- Reutilización: cualquier slice nuevo importa el envelope y los params sin copiar la forma.
- Bordes claros: la forma del envelope es shared; lo que pone adentro (`items`) lo decide cada slice.
- Defaults sensatos protegen contra requests sin paginación y contra `limit` abusivos.

**Negativas / trade-offs:**
- La migración futura a cursor-based va a requerir un envelope alternativo o coexistencia (a abordar cuando dispare el Pending).
- Offset-based tiene degradación de performance en datasets muy grandes e inestabilidad de páginas si hay inserts arriba — limitaciones conocidas y aceptadas por ahora.

## Relacionados

- `depende-de` → [api-contract.md](api-contract.md) — el envelope se expone en el OpenAPI que consume kubb.
