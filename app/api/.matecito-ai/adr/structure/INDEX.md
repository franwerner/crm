# Dominio: structure — Índice

**Criterio de pertenencia:** ADRs sobre la estructura del código: estilo arquitectónico, capas y reglas de dependencia, comunicación entre capas, organización de carpetas/naming y patrones de proyección de lectura (CQRS-lite). Es el "cómo se organiza y se acopla el código".

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [architecture-style.md](architecture-style.md) | Accepted | Estilo arquitectónico y acoplamiento | Diseñes un módulo/feature nuevo o evalúes introducir una abstracción. |
| [layers-and-dependencies.md](layers-and-dependencies.md) | Accepted | Capas y reglas de dependencia | Crees un archivo nuevo y debas decidir dónde va; agregues un import entre capas/slices; necesites datos de otro módulo (colaboración cross-slice por read-port). |
| [inter-layer-communication.md](inter-layer-communication.md) | Accepted | Comunicación entre capas | Pases datos entre handler/use-case/repo; decidas DTO vs entidad; ubiques validación; coordines slices. |
| [folder-structure.md](folder-structure.md) | Accepted | Estructura de carpetas y naming | Crees un archivo o carpeta nueva; cuestiones cómo nombrar algo; o cuando un slice crece y necesitás sub-agrupar archivos dentro de una capa. |
| [read-models-for-lists.md](read-models-for-lists.md) | Accepted | Read models para listas (CQRS-lite) | Crees/modifiques un endpoint de listado que necesite proyección enriquecida (JOINs, datos relacionados); crees un `*.query.ts` o `*.query.drizzle.ts`; entiendas la separación entre reads de lista y reads/writes de dominio. |
