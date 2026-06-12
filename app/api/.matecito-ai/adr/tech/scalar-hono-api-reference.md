# @scalar/hono-api-reference

- **Categoría:** Documentación / Contrato de API
- **Versión:** latest / sin pinear (greenfield — pinear con caret al inicializar)
- **Status:** Accepted
- **Decidido en fase:** api-documentation
- **Fecha:** 2026-05-17

## Por qué la elegimos

UI de documentación moderna y rápida para humanos, con cliente de prueba integrado, montada sobre el mismo spec OpenAPI que genera `@hono/zod-openapi`. Default de facto actual en el ecosistema Hono; mejor DX que Swagger UI.

## Alternativas descartadas

- **@hono/swagger-ui:** clásico y familiar, pero UI más pesada y DX más vieja.
- **Solo spec JSON sin UI:** se pierde la exploración manual de la API para devs.

## Notas

- Es solo el render para humanos. El endpoint de spec crudo (`/openapi.json`) va igual y es lo que consume kubb.
- **Exposición:** Scalar + spec abiertos solo en no-prod; **deshabilitados en producción vía flag de entorno** (`../delivery/configuration.md`). Ver `../contracts/api-contract.md` §exposición.
