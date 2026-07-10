# EDR — Configuración

- **Status:** Accepted
- **Type:** convention
- **Date:** 2026-05-17

## Contexto

Un CRM necesita config desde la primera línea (URL de la base de datos, puerto, secret de firma de tokens). Config sin validar al startup = la API arranca "bien" y explota a la primera request.

## Decisión

**Schema `zod` validado al startup**, en un módulo de config compartido:

- El módulo lee el entorno y lo valida con un schema `zod` al boot. Si falta o es inválida una variable, la API falla rápido y claro (no arranca).
- El resto del código consume el objeto de config tipado, nunca el entorno crudo y desperdigado.
- **Dev:** archivo de entorno local (gitignored). **Prod:** env vars reales del entorno.
- Reusa `zod` ya elegido (ver `../tech/zod.md`) — sin dependencia nueva.

## Alcance

- `src/shared/config/**` — único módulo de carga y validación de config; única sede que lee el entorno.

## Reglas verificables

- **[manual]** todo acceso a configuración pasa por `src/shared/config` (objeto tipado validado por zod); prohibido leer `Bun.env`/`process.env` fuera de ese módulo.
- **[manual]** el schema de config se valida en el arranque, antes de aceptar requests.
- **[manual]** el archivo de entorno local (`.env`) está en `.gitignore`; mantener un `.env.example` con las claves (sin valores).

## Alternativas consideradas

- **Env vars puras sin validación:** errores tardíos y crípticos. Descartado para una API real.
- **Schema zod + secret manager (Vault/cloud) desde ya:** overkill para greenfield solo; reconsiderable en producción seria.

## Consecuencias

**Positivas:** fallo temprano y explícito; config tipada en todo el código; reutiliza zod.

**Negativas / trade-offs:** el schema de config crece a mano con cada nueva variable; sin él, sin embargo, los errores serían tardíos y crípticos.

## Relacionados

- `relacionado-con` → [../security/secrets-management.md](../security/secrets-management.md) — cómo se aprovisionan y protegen los secretos que viven en estas env vars (política de secretos; este EDR cubre el mecanismo de carga/validación).
