# PostgreSQL

- **Categoría:** Base de datos
- **Versión:** latest estable / sin pinear (greenfield — fijar versión mayor en infra/compose al inicializar, ej. 16)
- **Status:** Accepted
- **Decidido en fase:** data-access
- **Fecha:** 2026-05-17

## Por qué la elegimos

Un CRM es datos relacionales con integridad fuerte: clientes, deals, actividades, pipeline y relaciones entre ellos. Postgres da transacciones ACID, constraints, joins y madurez para ese modelo. Default sólido y sin discusión para el dominio.

## Alternativas descartadas

- **SQLite:** excelente para empezar pero limita concurrencia/escala de un CRM multiusuario a futuro.
- **MongoDB:** el modelo de un CRM es fuertemente relacional; documentos forzarían joins en aplicación.

## Notas

- El motor solo se accede desde el adapter del slice (`*.repository.bun.ts`) vía Drizzle — ver `../data/data-access.md` y reglas de dependencia #4/#7 en `../structure/layers-and-dependencies.md`.
- Pinear la versión mayor en el setup de infraestructura (docker-compose / proveedor) al inicializar.
