# ADR 00 — Contexto del proyecto (app/ui)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase del bootstrap:** 0

## Contexto

`app/ui` es el frontend del monorepo CRM. Greenfield (directorio vacío al bootstrapear). Paquete autónomo: sus convenciones NO se heredan de `app/api`. Lo único compartido con `app/api` es el contrato OpenAPI que este paquete consume.

## Decisión

- **Tipo:** SPA client-side (CRM interno autenticado, sin SEO).
- **Stack:** React + Vite + TanStack Query · TypeScript · Bun (package manager / runner). Ver `tech/INDEX.md`.
- **Consumo de API:** kubb genera tipos + cliente + hooks de react-query desde el OpenAPI de `app/api` (ADR 12 de la API).
- **Equipo:** 1 (solo dev).
- **Madurez:** greenfield.

## Alternativas consideradas

- **SSR / SSG:** descartado — CRM interno privado, sin necesidad de SEO; SPA es más simple de deployar.
- **Vue / Solid / Svelte:** descartados a favor de React por ecosistema CRM (tablas/forms) y soporte de kubb.

## Consecuencias

**Positivas:** ecosistema maduro para CRM; contrato de API tipado de punta a punta vía kubb; deploy estático simple.

**Negativas / trade-offs:** dependencia fuerte del contrato OpenAPI de `app/api` (mitigada con regeneración en CI — ADR 09).

## Reglas concretas

- Todo ADR de este paquete vive en `app/ui/.claude/adr/`. Autónomo respecto de `app/api`.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial | ifran |
