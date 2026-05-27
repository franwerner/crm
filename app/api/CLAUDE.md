# Project Conventions for Claude — app/api

Las decisiones arquitectónicas y de convenciones de este paquete (`app/api`) están en `.claude/adr/`.

**Antes de escribir código que toque arquitectura, capas, errores, auth, datos o convenciones, leé `.claude/adr/INDEX.md`** para saber qué ADR consultar.

**Antes de instalar/sugerir cualquier dependencia nueva (lib, framework, herramienta, DB), leé `.claude/adr/tech/INDEX.md`** para ver qué tecnologías ya están elegidas. Si tu sugerencia pisa con algo ya registrado, no la introduzcas sin preguntar al usuario.

Si una decisión no está documentada o algo no queda claro, **preguntá al usuario antes de inventar una convención**. Las decisiones se registran como ADR, no se improvisan.

> **Importante:** las convenciones de este paquete NO se heredan de ni a otros paquetes (`app/ui`). Son autónomas.

> **Override de Strict TDD (RESUELTO — autoritativo para este paquete):** el `~/.claude/CLAUDE.md` global declara `Strict TDD Mode: enabled` para todos los proyectos. **Para `crm/app/api` ese modo está DESACTIVADO**, en coherencia con la decisión de arquitectura de `testing-strategy.md` (arrancar sin tests, decisión consciente tras pushback x2). Este override es de alcance proyecto: NO toca la config global ni afecta otros repos. **No asumas TDD ni test-first al trabajar en `app/api`**: no escribas tests salvo pedido explícito; leé `testing-strategy.md` para el contexto y el trigger de reevaluación.

Para crear, actualizar o revisar decisiones arquitectónicas (incluyendo agregar/cambiar tecnologías del catálogo), usá la skill `architecture-bootstrap`.
