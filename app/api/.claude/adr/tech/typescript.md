# TypeScript

- **Categoría:** Lenguaje
- **Versión:** latest / sin pinear (greenfield — pinear como devDependency al inicializar; Bun ejecuta TS nativo sin transpile step)
- **Status:** Accepted
- **Decidido en fase:** 0
- **Fecha:** 2026-05-17

## Por qué la elegimos

Tipado estático sobre JavaScript: contratos explícitos entre capas, refactors seguros, mejor DX. Bun ejecuta TypeScript de forma nativa sin paso de build separado, así que el costo de adopción es casi nulo. Estándar de facto para APIs serias en el ecosistema JS.

## Alternativas descartadas

- **JavaScript plano:** sin tipos no hay forma de enforcar contratos entre capas ni reglas de dependencia verificables; descartado para un proyecto con arquitectura en capas.

## Notas

- `tsconfig.json` debe arrancar en modo estricto: `strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`. Definir al inicializar.
- Las reglas de dependencia entre capas (ver `02-layers-and-dependencies.md`) se podrán enforcar con un linter de imports (ej. `eslint-plugin-boundaries` o `dependency-cruiser`) apoyado en los paths de TS.
