# ADR — Acceso a datos

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-06-17 (UoW port Pending → Accepted: trigger de atomicidad multi-repo satisfecho por ingesta de contactos)
- **Decisores:** ifran
- **Fase:** data-access

## Contexto

Un CRM es datos relacionales con integridad fuerte (clientes, deals, actividades, relaciones). El acceso a datos debe quedar encapsulado para no acoplar la lógica a la infraestructura.

## Decisión

- **Motor:** **PostgreSQL** (ver `../tech/postgresql.md`).
- **Capa de acceso:** **Drizzle ORM** + **drizzle-kit** para migraciones (ver `../tech/drizzle.md`).
- **Patrón Repository:** sí. Cada slice define su puerto `*.repository.ts` (interface) y su adapter `*.repository.bun.ts` (implementación con Drizzle). El use-case nunca ve Drizzle.
- **Migraciones:** gestionadas con `drizzle-kit`, directorio de migraciones versionado en el repo.
- **Mapeo:** el schema de Drizzle es infraestructura, NO el modelo de dominio. El adapter mapea fila DB ↔ entidad de dominio.

### Transacciones

**Por operación (default):** las transacciones se inician **dentro del adapter**, por operación. Cubre el CRUD y operaciones de un solo repo.

**Port de Unit of Work (Accepted — 2026-06-17):** cuando un use-case necesita atomicidad sobre más de un repositorio, se usa el puerto `UnitOfWork`. Trigger original satisfecho: la ingesta de contactos (Fase 1) requiere `bulk-insert contacts + checkpoint processedRows en imports` en una sola transacción atómica.

Contrato decidido:

```typescript
// src/shared/db/uow.ts
interface UnitOfWork {
  withTransaction<T>(fn: (tx: DrizzleTx) => Promise<T>): Promise<T>;
}

// src/shared/db/client.ts
export type DrizzleTx = Parameters<Parameters<Db['transaction']>[0]>[0];
```

- Adapter `DrizzleUnitOfWork` en la infraestructura del slice consumidor (p. ej. `imports/infrastructure/drizzle-unit-of-work.ts`).
- Los repositorios participantes aceptan un `tx?` opcional: cuando está presente usan la tx pasada; cuando está ausente se auto-gestionan (comportamiento existente).
- El use-case importa solo `@shared/db/uow` (el puerto). **NUNCA importa Drizzle directamente** (regla #2 de `../structure/layers-and-dependencies.md`).
- `DrizzleTx` se exporta desde `src/shared/db/client.ts` reutilizando el idioma `Parameters<...>` ya establecido en el repo.

## Alternativas consideradas

- **Prisma:** pesado, engine separado, fricción histórica en Bun.
- **Kysely + migraciones aparte:** muy bueno pero Drizzle integra ORM + migraciones.
- **Raw SQL:** sin tipado del resultado ni gestión de migraciones.
- Transacciones: "UoW port desde ya" (más andamiaje) y "en adapter sin port nunca" (riesgo si crece) — descartadas a favor del enfoque incremental.

## Consecuencias

**Positivas:** acceso a datos type-safe y encapsulado; ORM + migraciones en una herramienta; lógica desacoplada de la DB.

**Negativas / trade-offs:** el port de UoW expone `DrizzleTx` como tipo en los firmas de repositorio — los participantes de una UoW ven ese tipo vía el parámetro opcional `tx?`. Es una filtración controlada y explícita: está encapsulada en infra; el use-case nunca ve Drizzle.

## Reglas concretas

- Drizzle SOLO dentro de `*.repository.bun.ts` y adapters de UoW (`drizzle-unit-of-work.ts`). Prohibido importar Drizzle desde use-cases, domain o `*.routes.ts`.
- El use-case depende del puerto `*.repository.ts` y/o `UnitOfWork`, nunca del adapter ni de Drizzle directamente.
- Migraciones versionadas con drizzle-kit en el repo (no editar a mano la DB en prod).
- UoW port (`src/shared/db/uow.ts`) y tipo `DrizzleTx` (`src/shared/db/client.ts`) son la única forma de cruzar la barrera transaccional entre repositorios. No crear mecanismos alternativos.
