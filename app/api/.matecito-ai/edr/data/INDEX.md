# Dominio: `data` — Decisiones

Persistencia y datos: acceso a datos (ORM, repositorios, transacciones), convenciones de modelado (IDs, timestamps, borrado, enums, naming DB) y almacenamiento de archivos/object storage.

## EDRs en este dominio

| EDR | Status | Type | Consultá cuando... |
|---|---|---|---|
| [data-access.md](data-access.md) | Accepted | decision | Escribas una query, definas migraciones, manejes transacciones. |
| [data-modeling.md](data-modeling.md) | Accepted | convention | Crees/edites tablas Drizzle, definas IDs, timestamps, borrado, enums o naming de DB. |
| [file-storage.md](file-storage.md) | Accepted | decision | Manejes upload/download de archivos; agregues una entidad con documentos asociados; definas convención de keys de bucket, MIME whitelist o políticas de acceso. |

**Leyenda de status:** `Accepted` · `Pending` · `Not Applicable` · `Deferred` · `Superseded`.
