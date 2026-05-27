# Hono

- **Categoría:** Framework web
- **Versión:** latest / sin pinear (greenfield — pinear con caret al inicializar, ej. `^4.x`)
- **Status:** Accepted
- **Decidido en fase:** context
- **Fecha:** 2026-05-17

## Por qué la elegimos

Framework HTTP minimalista y de los más rápidos del ecosistema JS. Da routing + middleware y nada más: sin DI provista, sin decorators, sin estructura impuesta. Eso da control total sobre la arquitectura (a costo de tener que diseñarla y sostenerla nosotros). Portable a Bun, Deno, Cloudflare Workers y Vercel Edge.

## Alternativas descartadas

- **NestJS:** demasiado opinado para este proyecto; DI y estructura provistas por el framework que no queríamos heredar.
- **Express / Fastify:** válidos pero más pesados/legacy en el caso de Express; Hono ofrece mejor performance y portabilidad edge con API más chica.

## Notas

- **Implicancia arquitectónica clave:** Hono NO inyecta dependencias. La inyección de dependencias y el composition root son responsabilidad nuestra — ver `architecture-style.md`, `layers-and-dependencies.md` y `dependency-injection.md`.
- API REST sobre Hono: usar `hono/validator` o adapter (zod) para validación en el borde — ver `inter-layer-communication.md`.
- Manejo de errores: Hono expone `app.onError` para un handler global — ver `error-handling.md`.
