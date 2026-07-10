# EDR — Acceso a datos

- **Status:** Accepted
- **Type:** decision
- **Date:** 2026-05-17
- **Applied pattern:** Repository — cada slice expone el acceso a datos tras un puerto; el use-case nunca ve el ORM.
- **Applied pattern:** Unit of Work — atomicidad multi-repositorio vía un puerto transaccional, sin exponer el ORM al use-case.

## Contexto

Un CRM es datos relacionales con integridad fuerte (clientes, deals, actividades, relaciones). El acceso a datos debe quedar encapsulado para no acoplar la lógica a la infraestructura.

## Decisión

- **Motor:** PostgreSQL (ver `../tech/postgresql.md`).
- **Capa de acceso:** Drizzle ORM + drizzle-kit para migraciones (ver `../tech/drizzle.md`).
- **Patrón Repository:** cada slice define un puerto (interface) y un adapter que lo implementa con el ORM. El use-case nunca ve el ORM.
- **Migraciones:** gestionadas con drizzle-kit, con el directorio de migraciones versionado en el repo.
- **Mapeo:** el schema del ORM es infraestructura, NO el modelo de dominio. El adapter mapea fila DB ↔ entidad de dominio.

### Transacciones

- **Por operación (default):** las transacciones se inician dentro del adapter, por operación. Cubre el CRUD y las operaciones de un solo repositorio.
- **Unit of Work (multi-repositorio):** cuando un use-case necesita atomicidad sobre más de un repositorio, se usa un puerto Unit of Work. El use-case importa solo el puerto; nunca el ORM. Los repositorios participantes aceptan una transacción opcional: cuando está presente la usan, cuando está ausente se auto-gestionan. El tipo de transacción compartido reutiliza el idioma de tipos ya establecido en el repo. Trigger que motivó el puerto: una ingesta masiva que requiere insertar registros y avanzar un checkpoint de progreso en una sola transacción atómica.

## Alcance

- `src/modules/**/infrastructure/*.repository.bun.ts` — adapters de repositorio; única sede del ORM dentro de un slice.
- `src/modules/**/infrastructure/*unit-of-work*.ts` — adapters de Unit of Work del slice consumidor.
- `src/shared/db/**` — puerto de Unit of Work y tipo de transacción compartidos.

## Reglas verificables

- **[tool: dependency-cruiser]** el ORM solo se importa desde `*.repository.bun.ts` y adapters de Unit of Work; prohibido desde use-cases, `domain/` o `*.routes.ts`.
- **[manual]** el use-case depende del puerto de repositorio y/o del puerto Unit of Work, nunca del adapter ni del ORM directamente.
- **[manual]** el puerto de Unit of Work y su tipo de transacción compartidos son la única forma de cruzar la barrera transaccional entre repositorios; no crear mecanismos alternativos.
- **[manual]** las migraciones se versionan con drizzle-kit en el repo; no editar la DB de prod a mano.

## Alternativas consideradas

- **Prisma:** pesado, engine separado, fricción histórica en Bun.
- **Kysely + migraciones aparte:** muy bueno, pero Drizzle integra ORM + migraciones en una sola herramienta.
- **Raw SQL:** sin tipado del resultado ni gestión de migraciones.
- **Transacciones — "Unit of Work desde ya"** (más andamiaje anticipado) y **"en adapter sin puerto nunca"** (riesgo si crece la atomicidad multi-repo): descartadas a favor del enfoque incremental (por operación por default, puerto cuando el trigger aparece).

## Consecuencias

**Positivas:** acceso a datos type-safe y encapsulado; ORM + migraciones en una herramienta; lógica desacoplada de la DB.

**Negativas / trade-offs:** el puerto de Unit of Work expone el tipo de transacción del ORM en las firmas de los repositorios participantes vía un parámetro opcional. Es una filtración controlada y explícita: está encapsulada en infraestructura; el use-case nunca ve el ORM.

## Relacionados

- `relacionado-con` → [../structure/layers-and-dependencies.md](../structure/layers-and-dependencies.md) — la regla de capas que prohíbe al use-case importar el ORM.
