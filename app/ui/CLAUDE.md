# Project Conventions for Claude — app/ui

Las decisiones arquitectónicas y de convenciones de este paquete (`app/ui`) están en `.claude/adr/`.

**Antes de escribir código que toque arquitectura, capas, estado, errores, auth, datos o convenciones, leé `.claude/adr/INDEX.md`** para saber qué ADR consultar.

**Antes de instalar/sugerir cualquier dependencia nueva, leé `.claude/adr/tech/INDEX.md`** para ver qué tecnologías ya están elegidas. Si tu sugerencia pisa con algo ya registrado, no la introduzcas sin preguntar al usuario.

Si una decisión no está documentada o algo no queda claro, **preguntá al usuario antes de inventar una convención**. Las decisiones se registran como ADR, no se improvisan.

> **Importante:** las convenciones de este paquete son **autónomas**. NO se heredan de `app/api`. Lo único compartido es el **contrato** (el OpenAPI de `app/api` que este paquete consume con kubb — ver `app/api` ADR 12 y este ADR 09/10).

> **Carpeta generada:** `src/shared/api/` es salida de kubb (artefacto). Es **read-only**: no se edita ni se revisa a mano; se regenera con el script `gen:api`.

> **Aviso de conflicto activo:** el harness tiene `Strict TDD Mode: enabled` pero la decisión de proyecto (ADR 06) es **arrancar sin tests**. Incoherencia consciente y documentada. No asumas TDD: leé `06-testing-strategy.md`.

Para crear, actualizar o revisar decisiones arquitectónicas, usá la skill `architecture-boostrap`.
