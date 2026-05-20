# ADR 12 — Documentación de la API (OpenAPI / contrato)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-19 (presentation por slice partida en 3: routes (declaración+wiring) / controller (solo handlers) / schemas (zod))
- **Decisores:** ifran
- **Fase del bootstrap:** Decisión nueva post-bootstrap (no cubierta en las 7 fases)

## Contexto

La API necesita documentación que no se desactualice y que sirva como contrato para el frontend. El frontend (`app/ui`) usa **kubb** para generar tipos/cliente tipados a partir de un spec OpenAPI. Hace falta definir cómo se genera y se expone ese contrato. Conecta con ADR 02 (capa presentation), ADR 03 §3.1/§3.4 (DTOs de borde + validación zod), ADR 08 (config por entorno) y ADR 10 (auth).

## Decisión

**Fuente única de verdad: el schema `zod` del borde.** El mismo schema que valida request/response (ADR 03 §3.4) y define input DTO / output view-model (ADR 03 §3.1) genera el OpenAPI. No se escribe ni mantiene documentación a mano.

1. **Generación:** `@hono/zod-openapi` (middleware oficial Hono). Ver `tech/hono-zod-openapi.md`.
2. **Spec:** se expone OpenAPI 3.x crudo en un endpoint (ej. `GET /openapi.json`). Es lo que consume kubb.
3. **UI para humanos:** `@scalar/hono-api-reference` sobre el mismo spec. Ver `tech/scalar-hono-api-reference.md`.
4. **Contrato = borde, no dominio:** el spec describe los schemas de borde (input DTO / output view-model). Las entidades de dominio NUNCA se exponen (refuerza ADR 03 §3.1).
5. **Consumidor frontend:** kubb vive en `app/ui` (NO es dependencia de `app/api`). Corre en build/CI del front, no en runtime del navegador. Se registra en el catálogo tech de `app/ui` cuando ese paquete se bootstrapee.

### Exposición / seguridad
- **No-prod (dev/staging):** Scalar + `/openapi.json` **abiertos**. kubb consume el spec desde ahí (o en CI).
- **Producción:** docs UI **y** endpoint de spec **deshabilitados** vía flag de entorno (gestionado por el módulo de config del ADR 08). No se expone la superficie de la API a Internet.
- Justificación: el spec es el mapa completo de la API; en un CRM con datos sensibles, exponerlo público es superficie de ataque innecesaria. kubb no lo necesita en prod (corre en build/CI), así que cerrarlo no tiene costo funcional.

## Alternativas consideradas

- **hono-openapi:** menos invasivo en routes, ecosistema menos maduro — no elegido.
- **OpenAPI a mano / herramienta aparte:** rompe la fuente única de verdad; docs se desincroniza, kubb genera tipos que mienten — descartado.
- **Swagger UI:** UI más pesada/vieja — no elegido frente a Scalar.
- **Docs públicas siempre / detrás de auth en prod / spec a archivo:** descartadas a favor de "abierta en no-prod, cerrada en prod por flag".

## Consecuencias

**Positivas:**
- La docs nunca miente: es el mismo código que valida (si miente, el request falla).
- El frontend obtiene tipos automáticos vía kubb sin mantenimiento manual.
- Superficie de API no expuesta en producción.

**Negativas / trade-offs:**
- `@hono/zod-openapi` **define cómo se escribe la capa presentation**: las rutas se declaran con `OpenAPIHono` + `createRoute` (ruta + schema + metadata juntos) en `*.routes.ts`. No es un add-on transparente — impacta el estilo de la capa presentation (ver ADR 02).
- En prod no hay docs viva; quien necesite explorarla usa dev/staging.

## Reglas concretas

- Los schemas zod del borde se definen en `<feature>.schemas.ts` (sin Hono, sin lógica). Las funciones handler se implementan en `<feature>.controller.ts` (recibe Context de Hono, llama al use-case, arma la respuesta; sin `createRoute` ni creación del router). La declaración de rutas — `createRoute` (ruta + schema + metadata juntos), creación del `OpenAPIHono` y el cableado `.openapi(route, handler)` — vive en `<feature>.routes.ts`, que importa schemas de `.schemas.ts` y handlers de `.controller.ts` y exporta el router del slice. El principio "ruta + schema + metadata juntos" se preserva; la fuente única de verdad schema-first para el OpenAPI que consume kubb en `app/ui` NO cambia.
- `<feature>.routes.ts` es el archivo de presentation que el composition root (`app.ts`) monta.
- Prohibido documentar la API a mano o con un spec desacoplado de los schemas zod.
- El spec describe SOLO schemas de borde (DTO/view-model). Una entidad de dominio nunca debe aparecer en el OpenAPI.
- El endpoint de spec (`/openapi.json`) y la UI Scalar se registran/activan condicionados por el flag de entorno del módulo de config (ADR 08): activos en no-prod, inactivos en prod.
- kubb NO se agrega como dependencia de `app/api`; pertenece a `app/ui`.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial (post-bootstrap). @hono/zod-openapi + Scalar + spec JSON; abierta en no-prod, cerrada en prod por flag | ifran |
| 2026-05-19 | Presentation por slice: `<feature>.routes.ts` → `<feature>.controller.ts`; schemas zod del borde extraídos a `<feature>.schemas.ts`. Sin cambios en reglas de dependencia. | ifran |
| 2026-05-19 | Refina la entrada anterior del mismo día: presentation por slice queda en 3 archivos — `<feature>.routes.ts` (OpenAPIHono + createRoute + registro), `<feature>.controller.ts` (solo funciones handler), `<feature>.schemas.ts` (zod del borde). Sin cambios en reglas de dependencia. | ifran |
