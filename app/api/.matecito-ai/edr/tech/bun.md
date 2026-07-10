# Bun

- **Category:** Lenguaje y runtime
- **Version:** latest / sin pinear
- **Status:** Accepted
- **Decided in phase:** context
- **Date:** 2026-05-17

## Por qué la elegimos

Runtime único que reemplaza Node + npm/pnpm + Jest + esbuild: package manager, test runner y bundler integrados, con arranque y ejecución más rápidos que Node. Compatible con targets edge/serverless. Elegido también explícitamente como decisión de aprendizaje (stack nuevo en un greenfield, sin costo de migración).

## Alternativas descartadas

- **Node.js (clásico):** ecosistema maduro pero requiere ensamblar runtime + package manager + test runner + bundler por separado; más config y dependencias.
- **Deno:** filosofía similar (all-in-one, TS nativo) pero menor compatibilidad con el ecosistema npm y menos tracción en el equipo.

## Notas

- Greenfield: pinear la versión de Bun apenas se inicialice el proyecto (`bun.lockb` + campo `engines`/`.bun-version`).
- Bun trae test runner propio (`bun test`) — ver `../delivery/testing-strategy.md` cuando se defina la estrategia de testing.
