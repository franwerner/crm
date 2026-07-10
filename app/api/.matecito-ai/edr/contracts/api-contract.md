# EDR — Documentación de la API (OpenAPI / contrato)

- **Status:** Accepted
- **Type:** convention
- **Date:** 2026-05-17

## Contexto

La API necesita documentación que no se desactualice y que sirva como contrato para el frontend. El paquete de UI genera tipos y cliente tipados a partir de un spec OpenAPI (vía kubb, en build/CI). Hace falta definir cómo se genera y se expone ese contrato para que el front consuma un contrato confiable y la documentación no derive de la implementación real.

## Decisión

**Fuente única de verdad: el schema de validación del borde.** El mismo schema que valida request/response y define el DTO de entrada y el view-model de salida genera el OpenAPI. No se escribe ni se mantiene documentación a mano.

1. **Generación:** vía el middleware oficial de OpenAPI de Hono (`@hono/zod-openapi`), que declara ruta, schema y metadata juntos.
2. **Spec:** se expone OpenAPI 3.x crudo en un endpoint público de spec. Es lo que consume kubb.
3. **UI para humanos:** Scalar (`@scalar/hono-api-reference`) sobre el mismo spec.
4. **Contrato = borde, no dominio:** el spec describe solo los schemas de borde (DTO de entrada / view-model de salida). Las entidades de dominio nunca se exponen.
5. **Consumidor frontend:** kubb vive en el paquete de UI, no es dependencia de este paquete; corre en build/CI del front, no en runtime del navegador.

### Exposición / seguridad

- **No-prod (dev/staging):** UI de docs y endpoint de spec **abiertos**. kubb consume el spec desde ahí (o en CI).
- **Producción:** UI de docs **y** endpoint de spec **deshabilitados** vía flag de entorno. No se expone la superficie de la API a Internet.
- **Justificación:** el spec es el mapa completo de la API; en un CRM con datos sensibles, exponerlo público es superficie de ataque innecesaria. kubb no lo necesita en prod (corre en build/CI), así que cerrarlo no tiene costo funcional.

## Alcance

- `src/modules/*/http/**/*.routes.ts` — declaración de rutas: ruta + schema + metadata juntos, creación del router del slice y su cableado; es lo que monta el composition root.
- `src/modules/*/http/**/*.controller.ts` — handlers HTTP: reciben el contexto de request, llaman al use-case y arman la respuesta; sin declaración de ruta ni creación de router.
- `src/modules/*/http/dto/**/*.ts` — schemas zod del borde (DTO de entrada / view-model de salida); fuente única de verdad del OpenAPI, sin dependencia de Hono ni lógica.

## Reglas verificables

- **[manual]** Prohibido documentar la API a mano o con un spec desacoplado de los schemas del borde.
- **[manual]** El spec describe SOLO schemas de borde (DTO / view-model); ninguna entidad de dominio aparece en el OpenAPI.
- **[manual]** El endpoint de spec y la UI de docs se activan condicionados por el flag de entorno de config: activos en no-prod, inactivos en prod.
- **[manual]** kubb no se agrega como dependencia de este paquete; pertenece al paquete de UI.

## Alternativas consideradas

- **hono-openapi:** menos invasivo en las rutas, pero ecosistema menos maduro — no elegido.
- **OpenAPI a mano / herramienta aparte:** rompe la fuente única de verdad; la docs se desincroniza y kubb genera tipos que mienten — descartado.
- **Swagger UI:** UI más pesada y vieja — no elegido frente a Scalar.
- **Docs públicas siempre / detrás de auth en prod / spec a archivo:** descartadas a favor de "abierta en no-prod, cerrada en prod por flag".

## Consecuencias

**Positivas:**
- La docs nunca miente: es el mismo código que valida (si mintiera, el request fallaría).
- El frontend obtiene tipos automáticos vía kubb sin mantenimiento manual.
- Superficie de API no expuesta en producción.

**Negativas / trade-offs:**
- El middleware de OpenAPI **define cómo se escribe la capa presentation**: las rutas se declaran junto con su schema y metadata. No es un add-on transparente — impacta el estilo de la capa presentation.
- En prod no hay docs viva; quien necesite explorarla usa dev/staging.

## Relacionados

- `depende-de` → [../structure/inter-layer-communication.md](../structure/inter-layer-communication.md) — DTOs de borde y validación zod que alimentan el spec.
- `relacionado-con` → [../structure/layers-and-dependencies.md](../structure/layers-and-dependencies.md) — la capa presentation cuyo estilo condiciona esta decisión.
- `relacionado-con` → [../delivery/configuration.md](../delivery/configuration.md) — flag de entorno que gatea docs y endpoint de spec.
- `relacionado-con` → [../tech/hono-zod-openapi.md](../tech/hono-zod-openapi.md) — middleware de generación del spec.
- `relacionado-con` → [../tech/scalar-hono-api-reference.md](../tech/scalar-hono-api-reference.md) — UI de docs para humanos.
