# Dominio: data — Índice

**Criterio de pertenencia:** ADRs sobre persistencia y datos: acceso a datos (ORM, repositorios, transacciones), convenciones de modelado (IDs, timestamps, borrado, enums, naming DB) y almacenamiento de archivos/object storage.

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [data-access.md](data-access.md) | Accepted | Acceso a datos | Escribas una query, definas migraciones, manejes transacciones. |
| [data-modeling.md](data-modeling.md) | Accepted | Convenciones de modelado de datos | Crees/edites tablas Drizzle, definas IDs, timestamps, borrado, enums o naming de DB. |
| [file-storage.md](file-storage.md) | Accepted | Storage de archivos (object storage) | Manejes upload/download de archivos; agregues una entidad con documentos asociados; definas convención de keys de bucket, MIME whitelist o políticas de acceso. |

## Tablas del paquete

Registro de las tablas Drizzle del paquete (todas siguen `data-modeling.md`: UUIDv7, timestamps tz, soft-delete donde aplica).

| Tabla | Origen | Notas |
|---|---|---|
| `contacts`, `events`, `state_changes`, `users` | base / Contact pipeline | Entidades del core (ver `data-modeling.md`). |
| `imports` | Fase 1 — Ingesta Excel | Estado durable del job de import. |
| `analysis_templates` | Fase 2 — Enriquecimiento LLM | Plantillas de prompt para análisis LLM; entidad raíz con soft-delete y `template_version`. |
| `contact_insights` | Fase 2 — Enriquecimiento LLM | Resultado del enriquecimiento por contacto; `result` JSONB validado en application, `status` (`insight_status` enum), snapshot de `template_version`. |
