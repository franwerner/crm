# ADR 09 — Acceso a datos

- **Status:** Accepted (con sub-decisión de transacciones en Pending)
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase del bootstrap:** 5.5

## Contexto

Un CRM es datos relacionales con integridad fuerte (clientes, deals, actividades, relaciones). El acceso a datos debe quedar encapsulado para no acoplar la lógica a la infraestructura.

## Decisión

- **Motor:** **PostgreSQL** (ver `tech/postgresql.md`).
- **Capa de acceso:** **Drizzle ORM** + **drizzle-kit** para migraciones (ver `tech/drizzle.md`).
- **Patrón Repository:** sí. Cada slice define su puerto `*.repository.ts` (interface) y su adapter `*.repository.bun.ts` (implementación con Drizzle). El use-case nunca ve Drizzle.
- **Migraciones:** gestionadas con `drizzle-kit`, directorio de migraciones versionado en el repo.
- **Mapeo:** el schema de Drizzle es infraestructura, NO el modelo de dominio. El adapter mapea fila DB ↔ entidad de dominio.

### Transacciones  *(Accepted + sub-Pending)*
**Accepted (hoy):** las transacciones se inician **dentro del adapter**, por operación. Cubre el CRUD y operaciones de un solo repo.

> **Sub-decisión Pending — Port de Unit of Work.**
> Status: Pending. Trigger: *cuando un use-case necesite atomicidad sobre más de un repositorio*. En ese momento se introduce un puerto `withTransaction(...)` que el use-case invoca (impl con Drizzle en infra), preservando la regla #2 del ADR 02 (el use-case no conoce Drizzle).

## Alternativas consideradas

- **Prisma:** pesado, engine separado, fricción histórica en Bun.
- **Kysely + migraciones aparte:** muy bueno pero Drizzle integra ORM + migraciones.
- **Raw SQL:** sin tipado del resultado ni gestión de migraciones.
- Transacciones: "UoW port desde ya" (más andamiaje) y "en adapter sin port nunca" (riesgo si crece) — descartadas a favor del enfoque incremental.

## Consecuencias

**Positivas:** acceso a datos type-safe y encapsulado; ORM + migraciones en una herramienta; lógica desacoplada de la DB.

**Negativas / trade-offs:** atomicidad multi-repo no disponible hasta resolver el Pending de UoW.

## Reglas concretas

- Drizzle SOLO dentro de `*.repository.bun.ts`. Prohibido importar Drizzle desde use-cases, domain o `*.routes.ts`.
- El use-case depende del puerto `*.repository.ts`, nunca del adapter ni de Drizzle.
- Migraciones versionadas con drizzle-kit en el repo (no editar a mano la DB en prod).

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial. Transacciones: adapter ahora, UoW port Pending con trigger | ifran |
