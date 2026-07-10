# @hono/zod-openapi

- **Category:** Documentación / Contrato de API
- **Version:** latest / sin pinear
- **Status:** Accepted
- **Decided in phase:** api-documentation
- **Date:** 2026-05-17

## Por qué la elegimos

Middleware oficial de Hono que convierte los schemas `zod` del borde en una sola fuente de verdad: el mismo schema valida request/response en runtime y genera el spec OpenAPI 3.x automáticamente. El contrato no puede desincronizarse de la implementación. El frontend `app/ui` consume ese OpenAPI vía kubb para generar tipos/cliente tipados.

## Alternativas descartadas

- **hono-openapi:** menos invasivo en la capa de rutas pero ecosistema menos maduro que el middleware oficial.
- **OpenAPI escrito a mano / herramienta aparte:** rompe la fuente única de verdad; la docs se desincroniza y kubb generaría tipos que mienten.

## Notas

- **Implicancia arquitectónica (importante):** obliga a escribir la capa presentation con `OpenAPIHono` + `createRoute` (ruta + schema + metadata juntos). Define cómo se escriben las rutas del slice (ver `../structure/layers-and-dependencies.md` y `../contracts/api-contract.md`).
- El contrato expuesto son los **schemas del borde** (input DTO / output view-model), NUNCA entidades de dominio (`../structure/inter-layer-communication.md`).
- Produce OpenAPI 3.x; kubb (en `app/ui`) lo consume en build/CI, no en runtime del navegador.
