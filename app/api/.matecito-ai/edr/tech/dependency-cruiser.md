# dependency-cruiser

- **Category:** Enforcement de arquitectura
- **Version:** latest / sin pinear
- **Status:** Accepted
- **Decided in phase:** layers-and-dependencies
- **Date:** 2026-05-17

## Por qué la elegimos

Las reglas de dependencia de `../structure/layers-and-dependencies.md` están escritas como globs de path; dependency-cruiser las expresa 1:1 en su config y **falla el CI** si un import las viola. Es independiente del framework, así que es el **mismo tooling de enforcement para todo el monorepo** (`app/api` Bun/Hono y `app/ui` React/Vite) → consistencia.

## Alternativas descartadas

- **eslint-plugin-boundaries:** buen feedback en editor, pero atado a ESLint y modelo de "tipos de elemento"; en `app/api` se usa solo dependency-cruiser.
- **Nada / revisión manual:** las reglas pasarían a ser un deseo, no una convención.

## Notas

- La config (`.dependency-cruiser.js`) traduce las reglas de `../structure/layers-and-dependencies.md`. Mantenerla sincronizada si las reglas cambian.
- **Crítico:** debe correr en CI y romper el pipeline ante violación. Un script local sin gate de CI no cumple el objetivo.
- Se configura al scaffoldear el paquete, ANTES del primer feature.
