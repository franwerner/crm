# ADR 02 — Capas y reglas de dependencia (app/ui)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17 (enforcement definido)
- **Decisores:** ifran
- **Fase del bootstrap:** 2

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
│   │       ├── routes/                 # containers de ruta
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
| 3 | `src/shared/api/**` (salida kubb) es read-only generado: no se edita a mano y solo lo consumen los hooks de feature. |
| 4 | Componentes presentacionales (`src/features/*/components/**`, `src/shared/ui/**`) NO importan kubb, TanStack Query ni `shared/api`. Reciben datos por props. |
| 5 | Solo `src/features/*/hooks/**` consume `src/shared/api/**` y orquesta TanStack Query del feature. |
| 6 | `src/shared/ui/**` (design system) es presentacional puro: NO conoce features, API ni Query. |
| 7 | `src/app/**` (composición) es el ÚNICO que importa varias features para armar router/providers/guards. |

> La regla #4 mantiene viva la decisión container/presentational del ADR 01. Es la que más se viola sin querer — vigilarla.

## Enforcement (cómo se verifican estas reglas)

**Decisión: `dependency-cruiser` (gate de CI autoritativo) + `eslint-plugin-boundaries` (feedback en editor).** Ver `tech/dependency-cruiser.md` y `tech/eslint-plugin-boundaries.md`. No es "either/or".

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

- Organización por tipo de archivo — descartado (no escala, ver ADR 01).

## Consecuencias

**Positivas:** reglas verificables; features independientes; UI desacoplada de datos.

**Negativas / trade-offs:** enforcement requiere configurar eslint-plugin-boundaries.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial | ifran |
| 2026-05-17 | Enforcement definido: dependency-cruiser (CI gate) + eslint-plugin-boundaries (editor) | ifran |
