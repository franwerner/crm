# ADR — Convenciones de modelado de datos

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17 (gap UUID v7 resuelto)
- **Decisores:** ifran
- **Fase:** data-modeling-conventions

## Contexto

`data-access.md` definió la tecnología de acceso a datos (Drizzle ORM + PostgreSQL, patrón Repository) pero no normó las convenciones de modelado en sí: cómo se definen IDs, qué timestamps lleva cada tabla, cómo se maneja el borrado, cómo se declaran los enums ni las reglas de naming en la capa DB.

Al modelar las entidades del CRM (`Contact`, `Event`, `StateChange`, `User`) surgieron decisiones que podían haberse resuelto de múltiples formas. Para evitar divergencia entre tablas y entre desarrolladores, se cerraron estas convenciones de forma explícita. Este ADR las registra como reglas verificables que aplican a toda tabla Drizzle del paquete `app/api`.

Este ADR **complementa** `data-access.md` (no lo supersede). `data-access.md` sigue vigente en todo lo relativo a ORM, migraciones y patrón Repository.

## Decisión

- **IDs:** clave primaria `uuid` en todas las tablas, **sin `DEFAULT` en la DB**. El valor es un **UUID v7** (time-ordered) generado por la lib `uuidv7` (ver `tech/uuidv7.md`) a través del generador compartido `src/shared/id` (función `newId`). El borde que crea la entidad (use-case / composition root) invoca `newId()` y pasa el id a la factory del dominio. La factory valida que el id no sea vacío pero **no genera la identidad**; la DB tampoco. `crypto.randomUUID()` (= v4) no es sustituto válido.
- **Timestamps:** `created_at timestamptz NOT NULL DEFAULT now()` en todas las tablas. `updated_at timestamptz` solo en entidades mutables (`Contact`, `User`). Las entidades inmutables/append-only (`Event`, `StateChange`) no llevan `updated_at`.
- **Borrado:** soft-delete vía columna `deleted_at timestamptz NULL` en `Contact` y `User`. `Event` y `StateChange` nunca se borran ni editan: son append-only.
- **Enums:** `pgEnum` nativo de PostgreSQL, declarado con `pgEnum(...)` de Drizzle. Aplica a todos los sets de valores cerrados predefinidos por el producto: estado del pipeline, tipo de evento, canal de origen, nivel de interés.
- **Naming de la capa DB:** tablas y columnas en `snake_case`. Claves foráneas con sufijo `_id` (ej: `contact_id`, `author_id`, `created_by`). El naming del código TypeScript sigue `folder-structure.md`; esta regla aplica solo a la definición del schema Drizzle.
- **Schema Drizzle centralizado:** un único archivo `src/shared/db/schema.ts` (forzado por `drizzle.config.ts`). No hay schemas por slice.

## Alternativas consideradas

**IDs:**
- `serial` / `bigserial`: descartado. Filtra volumen de datos (enumerable) y es un dato potencialmente sensible para ids de entidades de clientes.
- UUID v4: descartado. No es time-ordered; peor localidad de índice B-tree comparado con UUID v7.
- ULID: descartado. UUID v7 cumple la misma necesidad (time-ordered, colisión negligible) sin agregar dependencia externa.

**Enums:**
- `text` + constraint `CHECK`: descartado. Más flexible para migraciones pero menos integridad en la DB y sin tipado automático en Drizzle.
- Lookup table: descartado. Sobreingeniería para sets fijos predefinidos por el producto que no cambian en runtime.

**Borrado (Contact/User):**
- Hard-delete: descartado. Borrar un `Contact` orfanaría su historial de `Event` y `StateChange`, que son append-only e inmutables. Rompe la observabilidad que es objetivo central del PRD (§3).

**Schema por slice:**
- Descartado. `drizzle-kit` requiere apuntar a un único archivo de schema para generar migraciones consistentes. Fragmentar el schema en slices complejiza la configuración sin beneficio real.

## Consecuencias

**Positivas:**
- Convenciones predecibles: una tabla nueva se define sin tomar decisiones ad-hoc sobre IDs, timestamps ni borrado.
- UUID v7 time-ordered mejora la localidad de índice respecto a UUID v4.
- `pgEnum` da integridad de datos en la DB y tipado automático en Drizzle.
- Soft-delete preserva la integridad referencial del historial inmutable.
- Schema centralizado simplifica la generación de migraciones con drizzle-kit.

**Negativas / trade-offs:**
- Agregar un valor a un `pgEnum` requiere una migración DDL (no es un INSERT en una tabla de configuración). Aceptable dado que los sets de valores están predefinidos por el producto y tienen baja rotación.
- Soft-delete en `Contact`/`User` requiere que todas las queries filtren `deleted_at IS NULL`. Si se olvida, se devuelven registros "borrados". Mitigación: encapsular en el Repository; el use-case nunca escribe la query directamente (`data-access.md`).
- **UUID v7 — gap resuelto, enforcement por convención:** la lib `uuidv7` está adoptada (ver `tech/uuidv7.md`) y el generador compartido `src/shared/id` es el único punto sancionado. Sin embargo, nada estructural impide que un desarrollador llame `crypto.randomUUID()` (v4) en vez de `newId()`. El enforcement es por convención + revisión de código + esta regla del ADR. No hay una regla de lint que lo bloquee (se puede agregar si se decide).

## Reglas concretas

| Convención | Regla |
|---|---|
| PK | `id uuid PRIMARY KEY` **sin DEFAULT** en todas las tablas. El UUID v7 lo produce el generador compartido `src/shared/id` (lib `uuidv7`, función `newId`); el use-case/composition root lo invoca y pasa el id a la factory. Ni la DB ni el dominio generan la identidad. NO usar `crypto.randomUUID()` ni `gen_random_uuid()` (ambos producen v4) |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` en TODAS las tablas |
| `updated_at` | `timestamptz` solo en `Contact` y `User`; ausente en `Event` y `StateChange` |
| Soft-delete | Columna `deleted_at timestamptz NULL` en `Contact` y `User`; ausente en `Event` y `StateChange` |
| Inmutabilidad | `Event` y `StateChange` no tienen `updated_at` ni `deleted_at`; no se editan ni borran |
| Enums | `pgEnum(...)` de Drizzle para todo set de valores cerrado predefinido por el producto |
| Naming DB | Tablas y columnas en `snake_case`; FKs con sufijo `_id` o forma `created_by`/`author_id` |
| Schema | Un único `src/shared/db/schema.ts`; no crear schemas por slice |
