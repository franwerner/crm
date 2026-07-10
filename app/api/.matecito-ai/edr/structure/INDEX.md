# Dominio: `structure` — Decisiones

Estructura del código: estilo arquitectónico, capas y reglas de dependencia, comunicación entre capas, organización de carpetas/naming y patrones de proyección de lectura (CQRS-lite). Es el "cómo se organiza y se acopla el código".

## EDRs en este dominio

| EDR | Status | Type | Consultá cuando... |
|---|---|---|---|
| [architecture-style.md](architecture-style.md) | Accepted | decision | Diseñes un módulo/feature nuevo o evalúes introducir una abstracción. |
| [layers-and-dependencies.md](layers-and-dependencies.md) | Accepted | policy | Crees un archivo nuevo y debas decidir dónde va; agregues un import entre capas/slices; necesites datos de otro módulo (colaboración cross-slice por read-port). |
| [inter-layer-communication.md](inter-layer-communication.md) | Accepted | convention | Pases datos entre handler/use-case/repo; decidas DTO vs entidad; ubiques validación; coordines slices. |
| [folder-structure.md](folder-structure.md) | Accepted | convention | Crees un archivo o carpeta nueva; cuestiones cómo nombrar algo; o cuando un slice crece y necesitás sub-agrupar archivos dentro de una capa. |
| [read-models-for-lists.md](read-models-for-lists.md) | Accepted | decision | Crees/modifiques un endpoint de listado que necesite proyección enriquecida (JOINs, datos relacionados); crees un read-port; entiendas la separación entre reads de lista y reads/writes de dominio. |
| [cross-slice-id-resolution.md](cross-slice-id-resolution.md) | Accepted | convention | Un slice necesite resolver IDs de otro aplicando filtros vía read-port sobre el schema compartido; reuses la gramática de filtros entre módulos; registres un nuevo consumo cross-slice de una tabla de otro módulo. |

**Leyenda de status:** `Accepted` · `Pending` · `Not Applicable` · `Deferred` · `Superseded`.
