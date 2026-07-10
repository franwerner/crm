# Project Conventions for Claude — app/ui

Las decisiones arquitectónicas y de convenciones de este paquete (`app/ui`) están en `.matecito-ai/edr/`.

**Antes de escribir código que toque arquitectura, capas, estado, errores, auth, datos o convenciones, leé `.matecito-ai/edr/INDEX.md`** para saber qué EDR consultar.

**Antes de construir o estilar UI (componentes, vistas, layouts), leé `.matecito-ai/edr/frontend/styling-and-design-system.md`** y usá `docs/visual/handoff/` (en la raíz del repo) como fuente visual: `tokens.css` (tokens del design system) y `components-reference.html` (referencia estructural/visual de cada componente). **No inventes colores ni espaciados: usá siempre los tokens** (roles shadcn / `--ds-*`). El stack es Tailwind v4 + shadcn/ui (componentes en `src/shared/ui`, los de dominio en `features/`). `docs/visual/brand-manual.md` describe otro producto (FinTech): NO lo uses como guía de composición.

**Antes de instalar/sugerir cualquier dependencia nueva, leé `.matecito-ai/edr/tech/INDEX.md`** para ver qué tecnologías ya están elegidas. Si tu sugerencia pisa con algo ya registrado, no la introduzcas sin preguntar al usuario.

Si una decisión no está documentada o algo no queda claro, **preguntá al usuario antes de inventar una convención**. Las decisiones se registran como EDR, no se improvisan.

> **Importante:** las convenciones de este paquete son **autónomas**. NO se heredan de `app/api`. Lo único compartido es el **contrato** (el OpenAPI de `app/api` que este paquete consume con kubb — ver `app/api` `.matecito-ai/edr/contracts/api-contract.md` y este `.matecito-ai/edr/data/data-access.md` / `.matecito-ai/edr/security/auth.md`).

> **Carpeta generada:** `src/shared/api/` es salida de kubb (artefacto). Es **read-only**: no se edita ni se revisa a mano; se regenera con el script `gen:api`.

> **Aviso de conflicto activo:** el harness tiene `Strict TDD Mode: enabled` pero la decisión de proyecto (`.matecito-ai/edr/delivery/testing-strategy.md`) es **arrancar sin tests**. Incoherencia consciente y documentada. No asumas TDD: leé `.matecito-ai/edr/delivery/testing-strategy.md`.

Para crear, actualizar o revisar decisiones arquitectónicas, usá la skill `project-decisions-bootstrap`.
