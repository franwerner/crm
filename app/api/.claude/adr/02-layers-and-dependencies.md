# ADR 02 — Capas y reglas de dependencia

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17 (*Props con la raíz; entities/ solo hijas no-raíz)
- **Decisores:** ifran
- **Fase del bootstrap:** 2

## Contexto

El ADR más importante: estas reglas las respeta Claude en cada sesión y se pueden enforzar automáticamente. En Vertical Slice las "capas" son estructura interna del slice + un shared kernel chico, no carpetas globales por capa.

## Decisión

Estructura confirmada:

```
app/api/
├── src/
│   ├── modules/
│   │   └── <feature>/                      # ej: customers/
│   │       ├── <feature>.routes.ts          # [presentation] handlers Hono, finos
│   │       ├── use-cases/                    # [application] lógica del slice, sin Hono
│   │       │   └── <verbo-sustantivo>.ts
│   │       ├── <entidad>.ts                  # [domain] raíz del agregado (class) + su estado (*Props)
│   │       ├── types/                         # [domain] sets cerrados / uniones (sin comportamiento)
│   │       ├── value-objects/                 # [domain] VOs con validación/igualdad (si hay)
│   │       ├── entities/                      # [domain] entidades hijas NO-raíz (sin repository propio)
│   │       ├── policies.ts                    # [domain] reglas puras del slice
│   │       ├── <feature>.repository.ts       # [port] interface del repo
│   │       └── <feature>.repository.bun.ts   # [adapter] implementación concreta
│   ├── shared/                               # shared kernel — NO conoce features
│   │   ├── errors/
│   │   ├── http/
│   │   ├── db/
│   │   └── config/
│   ├── app.ts                                # composition root: arma Hono + cablea deps
│   └── server.ts                             # bootstrap (Bun.serve)
└── tests/                                    # ver ADR 06 (Pending)
```

## Reglas concretas (verificables — enforzables con dependency-cruiser / eslint-plugin-boundaries)

| # | Regla |
|---|---|
| 1 | El **conjunto de dominio del slice** — `src/modules/*/{<entidad>.ts,types/**,value-objects/**,entities/**,policies.ts}` — solo importa dentro de su propio slice de dominio y de `src/shared/errors/**`. NUNCA Hono, NUNCA DB, NUNCA otro slice. |
| 2 | `src/modules/*/use-cases/**` importa cualquiera de los archivos de dominio de SU slice (`<entidad>.ts`, `types/**`, `value-objects/**`, `entities/**`, `policies.ts`) + la interface `*.repository.ts` de SU slice + `src/shared/**`. NUNCA Hono, NUNCA `*.repository.bun.ts`. |
| 3 | `src/modules/*/*.routes.ts` importa los `use-cases/**` de SU slice + `src/shared/http/**`. NUNCA toca DB ni adapter concreto directamente. |
| 4 | `src/modules/*/*.repository.bun.ts` (adapter) implementa el puerto y puede importar `src/shared/db/**`. Es el único que toca la DB. |
| 5 | **Slices aislados:** `src/modules/A/**` NO importa de `src/modules/B/**`. La colaboración cross-slice pasa por el composition root o por contratos públicos explícitos, nunca por import directo. |
| 6 | `src/shared/**` NO importa NADA de `src/modules/**`. El kernel no conoce features. |
| 7 | `src/app.ts` (composition root) es el ÚNICO que puede importar adapters concretos (`*.repository.bun.ts`) y cablearlos. |

> La regla #5 es el corazón del Vertical Slice. Es la que más se viola sin querer — vigilarla.

> **Nota (ver ADR 12):** la capa presentation (`*.routes.ts`) se escribe con `OpenAPIHono` + `createRoute` usando los schemas zod del borde. El estilo de los handlers está condicionado por la decisión de documentación/contrato de API — consultá `12-api-documentation.md` antes de crear o tocar rutas.

## Enforcement (cómo se verifican estas reglas)

**Decisión: `dependency-cruiser`** (ver `tech/dependency-cruiser.md`). No es opcional ni "either/or": las 7 reglas se traducen a `.dependency-cruiser.js` y se verifican automáticamente.

Pasos (al scaffoldear el paquete, ANTES del primer feature):

1. `dependency-cruiser` como devDependency.
2. `.dependency-cruiser.js` traduciendo las 7 reglas (los globs ya están escritos arriba).
3. Script `"arch": "depcruise src"` en `package.json`.
4. **Gate de CI obligatorio:** el pipeline corre `arch` y **falla ante cualquier violación**. Sin este paso, las reglas son un deseo, no una convención.
5. (Opcional) pre-commit hook para feedback antes de pushear.

> Una regla que solo vive en este markdown no se cumple sola. El gate de CI (paso 4) es lo que convierte estas 7 reglas en una convención real.

> El glob de `dependency-cruiser` para la capa de dominio debe apuntar al conjunto completo del dominio del slice (`<entidad>.ts`, `types/**`, `value-objects/**`, `entities/**`, `policies.ts`), no a un único `<feature>.ts`.

## Alternativas consideradas

- Carpetas globales por capa (`controllers/`, `services/`) — descartado: rompe la cohesión por feature del ADR 01.

## Consecuencias

**Positivas:** reglas verificables automáticamente; slices independientes; dominio testeable.

**Negativas / trade-offs:** coordinación cross-slice más explícita; enforcement requiere configurar dependency-cruiser.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial | ifran |
| 2026-05-17 | Nota cruzada: la capa presentation se escribe con OpenAPIHono+createRoute (ADR 12) | ifran |
| 2026-05-17 | Enforcement definido: dependency-cruiser + gate de CI obligatorio (sacado del "either/or" vago) | ifran |
| 2026-05-17 | Dominio del slice dividido en archivos/carpetas (agregado en <entidad>.ts, + types/ value-objects/ entities/ policies.ts); regla #1 reescrita al "conjunto de dominio del slice"; sincronizado con ADR 11 | ifran |
| 2026-05-17 | <entidad>.ts ahora incluye el estado del agregado (*Props); entities/ son solo hijas no-raíz | ifran |
