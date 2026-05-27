# kubb

- **Categoría:** Generación de cliente API (contrato)
- **Versión:** latest / sin pinear (greenfield — pinear con caret al inicializar)
- **Status:** Accepted
- **Decidido en fase:** context (contrato definido en `api-documentation.md` de `app/api`)
- **Fecha:** 2026-05-17

## Por qué la elegimos

`app/ui` consume `app/api` a través de su OpenAPI (decidido en `app/api` `api-documentation.md`). kubb genera, a partir de ese spec, los tipos TypeScript + el cliente + los hooks de `@tanstack/react-query`. El contrato llega tipado de punta a punta y no se mantiene a mano.

## Alternativas descartadas

- **Escribir tipos/cliente a mano:** se desincroniza del backend, fuente de bugs; rompe la fuente única de verdad del `api-documentation.md` de `app/api`.
- **openapi-typescript / orval:** alternativas válidas; kubb se eligió por su integración con react-query y pipeline de plugins. (Decisión del usuario, alternativas no evaluadas en profundidad.)

## Notas

- **Frontera entre paquetes:** kubb vive y se ejecuta SOLO en `app/ui`, en build/CI — NO en runtime del navegador y NO es dependencia de `app/api`.
- **Fuente del spec:** el OpenAPI de `app/api` está abierto en no-prod (dev/staging) y cerrado en prod (ver `app/api` `api-documentation.md`). kubb lo consume desde dev/CI, no desde producción.
- Lo generado por kubb es **artefacto**: no se edita a mano. Si el contrato cambia, se regenera. Tratar la carpeta de salida como read-only.
- Define el pipeline: plugins de kubb (`@kubb/plugin-ts`, `@kubb/plugin-react-query`, etc.) — el detalle de plugins se ajusta al inicializar.
