# ADR 02 — Capas y reglas de dependencia

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17 (referencia cruzada a ADR 12)
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
│   │       ├── <feature>.ts                  # [domain] entidad/VO/reglas puras
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
| 1 | `src/modules/*/<feature>.ts` (domain) **solo** importa de sí mismo y de `src/shared/errors/**`. NUNCA Hono, NUNCA DB, NUNCA otro slice. |
| 2 | `src/modules/*/use-cases/**` importa el domain de SU slice + la interface `*.repository.ts` de SU slice + `src/shared/**`. NUNCA Hono, NUNCA `*.repository.bun.ts`. |
| 3 | `src/modules/*/*.routes.ts` importa los `use-cases/**` de SU slice + `src/shared/http/**`. NUNCA toca DB ni adapter concreto directamente. |
| 4 | `src/modules/*/*.repository.bun.ts` (adapter) implementa el puerto y puede importar `src/shared/db/**`. Es el único que toca la DB. |
| 5 | **Slices aislados:** `src/modules/A/**` NO importa de `src/modules/B/**`. La colaboración cross-slice pasa por el composition root o por contratos públicos explícitos, nunca por import directo. |
| 6 | `src/shared/**` NO importa NADA de `src/modules/**`. El kernel no conoce features. |
| 7 | `src/app.ts` (composition root) es el ÚNICO que puede importar adapters concretos (`*.repository.bun.ts`) y cablearlos. |

> La regla #5 es el corazón del Vertical Slice. Es la que más se viola sin querer — vigilarla.

> **Nota (ver ADR 12):** la capa presentation (`*.routes.ts`) se escribe con `OpenAPIHono` + `createRoute` usando los schemas zod del borde. El estilo de los handlers está condicionado por la decisión de documentación/contrato de API — consultá `12-api-documentation.md` antes de crear o tocar rutas.

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
