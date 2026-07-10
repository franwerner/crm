# EDR — Convenciones de modelado de datos

- **Status:** Accepted
- **Type:** convention
- **Date:** 2026-05-17

## Contexto

El acceso a datos ya estaba definido en tecnología y patrón (Drizzle ORM + PostgreSQL, patrón Repository), pero no normaba las convenciones de modelado en sí: cómo se definen los IDs, qué timestamps lleva cada tabla, cómo se maneja el borrado, cómo se declaran los enums ni las reglas de naming en la capa DB.

Al modelar las entidades del CRM surgieron decisiones que podían resolverse de múltiples formas. Para evitar divergencia entre tablas y entre desarrolladores, se cerraron estas convenciones de forma explícita, aplicables a toda tabla del paquete. Estas convenciones complementan el acceso a datos (no lo supersede): la tecnología, las migraciones y el patrón Repository siguen vigentes.

## Decisión

- **IDs:** clave primaria `uuid` en todas las tablas, sin `DEFAULT` en la DB. El valor es un UUID v7 (time-ordered) generado por un generador compartido en el borde que crea la entidad (use-case / composition root); ni la DB ni el dominio generan la identidad. UUID v4 no es sustituto válido.
- **Timestamps:** todas las tablas llevan timestamp de creación con default en la DB. El timestamp de última modificación existe solo en entidades mutables; las entidades inmutables/append-only no lo llevan.
- **Borrado:** soft-delete vía columna nullable de borrado en las entidades mutables. Las entidades append-only nunca se borran ni editan.
- **Enums:** enum nativo de PostgreSQL para todo set de valores cerrado predefinido por el producto.
- **Naming de la capa DB:** tablas y columnas en `snake_case`; claves foráneas con sufijo `_id`. El naming del código TypeScript sigue su propia convención de estructura; esta regla aplica solo a la definición del schema.
- **Schema centralizado:** un único archivo de schema para todo el paquete; no hay schemas por slice.

## Alcance

- `src/shared/db/schema.ts` — schema único y centralizado del paquete (forzado por la config de drizzle-kit).
- `src/shared/id/**` — generador compartido de identidad (UUID v7); única sede sancionada para producir ids.

## Reglas verificables

- **[manual]** PK `id uuid` sin `DEFAULT` en todas las tablas; el UUID v7 lo produce el generador compartido `src/shared/id` (lib `uuidv7`), invocado por el use-case/composition root, que lo pasa a la factory del dominio. No usar `crypto.randomUUID()` ni `gen_random_uuid()` (ambos producen v4).
- **[manual]** `created_at timestamptz NOT NULL DEFAULT now()` en TODAS las tablas.
- **[manual]** `updated_at timestamptz` solo en entidades mutables (hoy `Contact`, `User`); ausente en las append-only (hoy `Event`, `StateChange`).
- **[manual]** `deleted_at timestamptz NULL` (soft-delete) solo en entidades mutables (hoy `Contact`, `User`); ausente en las append-only, que no se editan ni borran.
- **[manual]** `pgEnum(...)` para todo set de valores cerrado predefinido por el producto.
- **[manual]** tablas y columnas en `snake_case`; FKs con sufijo `_id` o forma `created_by`/`author_id`.
- **[manual]** un único `src/shared/db/schema.ts`; no crear schemas por slice.

## Alternativas consideradas

**IDs:**
- `serial` / `bigserial`: descartado. Filtra volumen de datos (enumerable) y es potencialmente sensible para ids de entidades de clientes.
- UUID v4: descartado. No es time-ordered; peor localidad de índice B-tree que UUID v7.
- ULID: descartado. UUID v7 cumple la misma necesidad (time-ordered, colisión negligible) sin agregar dependencia externa.

**Enums:**
- `text` + constraint `CHECK`: descartado. Más flexible para migraciones pero menos integridad en la DB y sin tipado automático en el ORM.
- Lookup table: descartado. Sobreingeniería para sets fijos predefinidos por el producto que no cambian en runtime.

**Borrado (entidades mutables):**
- Hard-delete: descartado. Borrar una entidad orfanaría su historial append-only e inmutable, rompiendo la observabilidad que es objetivo central del producto.

**Schema por slice:**
- Descartado. drizzle-kit requiere apuntar a un único archivo de schema para generar migraciones consistentes; fragmentarlo complejiza la config sin beneficio real.

## Consecuencias

**Positivas:**
- Convenciones predecibles: una tabla nueva se define sin decisiones ad-hoc sobre IDs, timestamps ni borrado.
- UUID v7 time-ordered mejora la localidad de índice respecto a UUID v4.
- El enum nativo da integridad en la DB y tipado automático en el ORM.
- Soft-delete preserva la integridad referencial del historial inmutable.
- Schema centralizado simplifica la generación de migraciones.

**Negativas / trade-offs:**
- Agregar un valor a un enum nativo requiere una migración DDL (no un INSERT en una tabla de configuración). Aceptable: los sets de valores están predefinidos por el producto y tienen baja rotación.
- El soft-delete requiere que todas las queries filtren los registros borrados; si se olvida, se devuelven registros "borrados". Mitigación: encapsular en el Repository; el use-case nunca escribe la query directamente.
- **Enforcement por convención:** nada estructural impide usar un generador de UUID v4 en vez del generador compartido. El enforcement es por convención + revisión de código + esta regla; no hay lint que lo bloquee (se puede agregar si se decide).

## Relacionados

- `refina` → [data-access.md](data-access.md) — complementa el acceso a datos con las convenciones de modelado; no lo reemplaza.
- `depende-de` → [../tech/uuidv7.md](../tech/uuidv7.md) — lib de generación de UUID v7.
