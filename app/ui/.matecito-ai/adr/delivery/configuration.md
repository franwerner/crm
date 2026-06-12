# ADR — Configuración (app/ui)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase:** configuration

## Contexto

El front necesita saber a qué API pegarle, y eso cambia por entorno. Vite expone variables con prefijo `VITE_` vía `import.meta.env`. Config sin validar = la app buildea bien y explota en runtime con `undefined`.

## Decisión

**Módulo de config tipado + validado al startup**, en `src/shared/lib`:
- Lee `import.meta.env` y lo valida con un schema **zod** al arrancar la app; si falta o es inválida una `VITE_` var, falla rápido y claro.
- El resto del código consume el objeto de config **tipado**, nunca `import.meta.env` crudo y desperdigado.
- Variables esperadas (mínimo): URL base del API (consumida por kubb/cliente — ver `../data/data-access.md`), flags por entorno.
- `.env` (gitignored) en dev; variables reales por entorno en build/CI.
- Mismo principio que `app/api` `configuration.md` (fallar rápido al startup). Decisión autónoma.

## Alternativas consideradas

- `import.meta.env` crudo sin validación — errores tardíos y crípticos.
- Config tipada sin validación runtime — un `.env` mal seteado rompe sin mensaje claro.

## Consecuencias

**Positivas:** fallo temprano y explícito; config tipada en todo el código; reutiliza zod (ya presente).

**Negativas / trade-offs:** ninguno relevante; un pequeño módulo extra.

## Reglas concretas

- Todo acceso a configuración pasa por `src/shared/lib/config`. Prohibido leer `import.meta.env` fuera de ese módulo.
- El schema de config se valida al bootstrap (`main.tsx` / provider raíz) antes de renderizar la app.
- Mantener un `.env.example` con las claves `VITE_` (sin valores). `.env` en `.gitignore`.
