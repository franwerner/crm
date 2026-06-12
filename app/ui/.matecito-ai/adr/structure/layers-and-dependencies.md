# ADR — Capas y reglas de dependencia (app/ui)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-25
- **Decisores:** ifran
- **Fase:** layers-and-dependencies

## Contexto

El ADR más importante: reglas verificables que Claude respeta y se enforzan con `eslint-plugin-boundaries` / `dependency-cruiser`.

## Decisión — Estructura

```
app/ui/
├── src/
│   ├── features/
│   │   └── <feature>/                  # ej: customers/
│   │       ├── components/             # presentacionales (tontos)
│   │       ├── hooks/                  # orquestación (usan hooks de kubb)
│   │       ├── routes/                 # definiciones de ruta (factories — ver `../frontend/routing.md`)
│   │       ├── views/                  # pantallas/containers de ruta
│   │       └── <feature>.types.ts      # tipos propios (NO los del API)
│   ├── shared/                          # transversal — NO conoce features
│   │   ├── ui/                          # design system (atomic, agnóstico de dominio)
│   │   ├── lib/                         # utils, queryClient, config, adaptador RFC 7807
│   │   └── api/                         # SALIDA de kubb (artefacto, read-only)
│   ├── app/                             # composición: router, providers, guards, layout
│   └── main.tsx                         # bootstrap
```

## Reglas concretas (verificables — enforzables con eslint-plugin-boundaries)

| # | Regla |
|---|---|
| 1 | `src/features/A/**` NO importa de `src/features/B/**`. Features aisladas; lo común va a `shared/`, la composición a `app/`. |
| 2 | `src/shared/**` NO importa de `src/features/**`. El kernel no conoce features. |
| 3 | `src/shared/api/**` (salida kubb) es read-only generado: no se edita a mano. Lo pueden consumir las **features desde cualquier capa** (hooks, types, descriptors, components, routes) para derivar tipos/schemas del contrato. El kernel `shared/lib` y `shared/ui` NO lo importan. **Excepción acotada (2026-05-25):** `src/shared/lib/data-view/relations/**` SÍ puede importar `shared/api` — ahí viven los relation-resolvers contract-aware (ej. `userRelation`), una isla deliberada dentro del kernel. El resto de `shared/lib` y todo `shared/ui` siguen sin tocar `shared/api`. |
| 4 | Componentes presentacionales (`src/features/*/components/**`, `src/shared/ui/**`) NO importan kubb, TanStack Query ni Router directo; reciben datos por props/hooks. Los de **feature** SÍ pueden importar `shared/api` (tipos/schemas del contrato); `shared/ui` NO. |
| 5 | Las features pueden consumir `src/shared/api/**` desde cualquier capa (no solo hooks) para derivar del contrato y **evitar duplicación**. Trade-off consciente: se acopla la feature al artefacto generado, resignando el anti-corruption layer estricto (ver Historial 2026-05-24 y `../frontend/schema-driven-list-views.md`). |
| 6 | `src/shared/ui/**` (design system) es presentacional puro: NO conoce features, API ni Query. |
| 7 | `src/app/**` (composición) es el ÚNICO punto de ensamblado del árbol de rutas y providers. Las features DEFINEN sus rutas como factories en `features/<f>/routes/` (reciben el padre por parámetro); `app/` inyecta el padre y ensambla el árbol final. Las features nunca se importan entre sí (regla #1); `shared` tampoco las importa (#2). |

> La regla #4 mantiene la decisión container/presentational del `architecture-style.md` para las **libs externas de datos** (TanStack Query/Router, kubb). El acceso a `shared/api` (artefacto interno generado) se relajó el 2026-05-24 para permitir derivar del contrato y eliminar duplicación — ver `../frontend/schema-driven-list-views.md`.

## Enforcement (cómo se verifican estas reglas)

**Decisión: `dependency-cruiser` (gate de CI autoritativo) + `eslint-plugin-boundaries` (feedback en editor).** Ver `../tech/dependency-cruiser.md` y `../tech/eslint-plugin-boundaries.md`. No es "either/or".

- **dependency-cruiser:** traduce las 7 reglas a `.dependency-cruiser.js` y **falla el CI** ante violación. Es la fuente de verdad. Mismo tooling que `app/api` → consistencia en el monorepo.
- **eslint-plugin-boundaries:** marca la violación **en el editor mientras escribís** (loop de feedback corto). NO reemplaza el gate de CI; si difieren, manda dependency-cruiser.

Pasos (al scaffoldear el paquete, ANTES del primer feature):

1. `dependency-cruiser` y `eslint-plugin-boundaries` como devDependencies.
2. `.dependency-cruiser.js` + reglas de `boundaries` en la config de ESLint, ambas traduciendo las 7 reglas.
3. Scripts: `"arch": "depcruise src"` y el `lint` que ya incluye boundaries.
4. **Gate de CI obligatorio:** el pipeline corre `arch` y **falla ante cualquier violación**.
5. (Opcional) pre-commit hook.

> El gate de CI (paso 4) es lo que convierte estas 7 reglas en una convención real, no en un deseo.

## Alternativas consideradas

- Organización por tipo de archivo — descartado (no escala, ver `architecture-style.md`).

## Consecuencias

**Positivas:** reglas verificables; features independientes; UI desacoplada de datos.

**Negativas / trade-offs:** enforcement requiere configurar eslint-plugin-boundaries. Desde 2026-05-24, las features se acoplan al contrato generado (`shared/api`) sin un anti-corruption layer estricto: un cambio del contrato puede tocar varios archivos de la feature. Trade-off aceptado a cambio de eliminar duplicación (`../frontend/schema-driven-list-views.md`).
