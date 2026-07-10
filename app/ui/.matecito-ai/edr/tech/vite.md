# Vite

- **Categoría:** Build tool / dev server
- **Versión:** latest estable / sin pinear (greenfield — pinear con caret al inicializar)
- **Status:** Accepted
- **Decidido en fase:** context
- **Fecha:** 2026-05-17

## Por qué la elegimos

Build y dev server estándar para SPAs modernas: HMR rápido, configuración mínima, build optimizado. Encaja con SPA client-side y corre sobre Bun sin fricción.

## Alternativas descartadas

- **Webpack/CRA:** legacy, lento, CRA discontinuado.
- **Bundler nativo de Bun:** menos maduro para apps React con el ecosistema de plugins que da Vite.

## Notas

- Output estático → deploy simple (cualquier static host / CDN).
- La generación de tipos/cliente de la API NO es parte del build de Vite: la hace kubb por separado (ver `kubb.md`).
