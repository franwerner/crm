# Bun

- **Categoría:** Package manager / runtime de tooling
- **Versión:** latest / sin pinear (greenfield — pinear al inicializar)
- **Status:** Accepted
- **Decidido en fase:** context
- **Fecha:** 2026-05-17

## Por qué la elegimos

Consistencia de tooling en el monorepo: `app/api` ya usa Bun, usarlo también acá evita tener dos package managers/runtimes distintos en el mismo repo. Bun ejecuta Vite sin fricción y es rápido como package manager.

## Alternativas descartadas

- **pnpm:** muy bueno en monorepos front, pero sumaría un tooling distinto al de `app/api`.
- **npm:** estándar y compatible, pero más lento y con menos features.

## Notas

- Rol distinto al de Bun en `app/api` (allá es runtime de la app; acá es package manager + runner de Vite). Decisión autónoma de este paquete, no heredada.
- El build real de la SPA lo hace **Vite** (ver `vite.md`), Bun solo orquesta.
