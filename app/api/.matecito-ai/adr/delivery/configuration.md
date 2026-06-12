# ADR — Configuración

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase:** configuration

> **ADR hermano:** el manejo de secretos (cómo se aprovisionan y se protegen las credenciales que esta config contiene) vive en [`../security/secrets-management.md`](../security/secrets-management.md). Este ADR cubre el mecanismo de carga/validación de configuración; el otro, la política de secretos.

## Contexto

Un CRM necesita config desde la primera línea (URL de Postgres, puerto, secret de JWT). Config sin validar al startup = la API arranca "bien" y explota a la primera request.

## Decisión

**Schema `zod` validado al startup**, en un módulo `src/shared/config`:
- El módulo lee `Bun.env` y lo valida con un schema `zod` **al boot**. Si falta o es inválida una variable, la API **falla rápido y claro** (no arranca).
- El resto del código consume el objeto de config **tipado**, nunca `Bun.env`/`process.env` crudo y desperdigado.
- **Dev:** archivo `.env` (gitignored). **Prod:** env vars reales del entorno.
- Reusa `zod` ya elegido (ver `../tech/zod.md`) — sin dependencia nueva.

> El detalle de cómo se aprovisionan los secretos que viven en estas env vars (sin secret manager dedicado por ahora) está en [`../security/secrets-management.md`](../security/secrets-management.md).

## Alternativas consideradas

- **Env vars puras sin validación:** errores tardíos y crípticos. Descartado para una API real.
- **Schema zod + secret manager (Vault/cloud) desde ya:** overkill para greenfield solo; reconsiderable en producción seria (ver [`../security/secrets-management.md`](../security/secrets-management.md)).

## Consecuencias

**Positivas:** fallo temprano y explícito; config tipada en todo el código; reutiliza zod.

**Negativas / trade-offs:** el schema de config crece a mano con cada nueva variable; sin él, sin embargo, los errores serían tardíos y crípticos.

## Reglas concretas

- Todo acceso a configuración pasa por `src/shared/config` (objeto tipado validado por zod). Prohibido leer `Bun.env`/`process.env` fuera de ese módulo.
- El schema de config se valida en el arranque (`server.ts`/`app.ts`), antes de aceptar requests.
- `.env` está en `.gitignore`. Mantener un `.env.example` con las claves (sin valores) al inicializar.
