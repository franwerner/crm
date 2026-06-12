# Drizzle ORM (+ drizzle-kit)

- **Categoría:** ORM / Acceso a datos (incluye migraciones vía drizzle-kit)
- **Versión:** latest / sin pinear (greenfield — pinear con caret al inicializar)
- **Status:** Accepted
- **Decidido en fase:** data-access
- **Fecha:** 2026-05-17

## Por qué la elegimos

ORM SQL-first y type-safe, liviano, sin engine separado y con soporte first-class en Bun. Encaja con la filosofía minimalista / control total del stack (Bun + Hono): cero magia, queries cercanas al SQL, tipos inferidos. Trae `drizzle-kit` para generar y aplicar migraciones, así que cubre persistencia + migraciones con una sola herramienta.

## Alternativas descartadas

- **Prisma:** más DX de alto nivel y madurez, pero pesado, schema DSL propio, engine separado y fricción histórica en Bun.
- **Kysely:** query builder type-safe muy bueno, pero migraciones se gestionan aparte; Drizzle integra ambas cosas.
- **Raw SQL (postgres.js / bun:sql):** máximo control pero sin tipado del resultado ni gestión de migraciones.

## Notas

- **Encapsulación obligatoria:** Drizzle vive SOLO dentro del adapter `*.repository.bun.ts` de cada slice. El use-case ve únicamente la interface del puerto (`*.repository.ts`) — nunca importa Drizzle. Esto preserva el acoplamiento Pragmático (ver `../structure/architecture-style.md`) y la regla #2/#4 (ver `../structure/layers-and-dependencies.md`).
- Migraciones con `drizzle-kit` — directorio de migraciones versionado en el repo. Ver `../data/data-access.md`.
- El schema de Drizzle es detalle de infraestructura, NO es el modelo de dominio. El dominio del slice (`customer.ts`) no se define con Drizzle; el adapter mapea entre fila DB ↔ entidad de dominio.
