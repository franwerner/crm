# ADR — Acceso a datos: kubb + TanStack Query (app/ui)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase:** data-access

## Contexto

`app/ui` consume `app/api` a través de su OpenAPI (`app/api` `api-documentation.md`). El "qué" (kubb + TanStack Query) se decidió en Fase 0; acá se fijan las convenciones de uso y el workflow de regeneración.

## Decisión

- **Generación:** kubb genera tipos + cliente + hooks de react-query (`@kubb/plugin-ts`, `@kubb/plugin-react-query`) + schemas zod de forms (`@kubb/plugin-zod`). Ver `tech/kubb.md`.
- **Fuente del spec:** el OpenAPI de `app/api` servido en **dev/staging** (abierto ahí, cerrado en prod — `app/api` `api-documentation.md`). kubb NO consume el spec en prod.
- **Workflow:** script versionado (`gen:api`) que regenera. **El CI falla si lo generado está desincronizado** del spec. Evita el bug "el back cambió y nadie regeneró".
- **Carpeta generada:** `src/shared/api/` es **artefacto read-only**: no se edita ni se revisa a mano; se regenera. Solo la consumen los hooks de feature (`layers-and-dependencies.md` reglas #3 y #5).
- **Estado de servidor:** TanStack Query siempre (`inter-layer-communication.md` §3.2). El `QueryClient` y sus defaults (staleTime, retry) viven en `src/shared/lib`.

## Alternativas consideradas

- Artefacto `openapi.json` committeado — desacopla del API corriendo, pero hay que acordarse de actualizarlo.
- Regeneración manual ad-hoc — máximo riesgo de tipos desincronizados.
- openapi-typescript / orval — alternativas a kubb no evaluadas en profundidad (kubb elegido por integración react-query, ver `tech/kubb.md`).

## Consecuencias

**Positivas:** contrato tipado de punta a punta sin mantenimiento manual; desincronización detectada en CI.

**Negativas / trade-offs:** dependencia del spec dev de `app/api`; el CI necesita acceso a ese spec (o a un artefacto exportado).

## Reglas concretas

- Nunca editar `src/shared/api/**` a mano. Si el contrato cambia: regenerar con `gen:api`.
- Nunca escribir tipos/cliente/hooks de API a mano que dupliquen lo generado.
- Estado de servidor exclusivamente vía hooks de Query (generados o que envuelven a los generados), nunca en estado global de cliente.
- CI debe correr `gen:api` y fallar si hay diff.
