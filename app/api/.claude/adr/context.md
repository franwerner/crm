# ADR — Contexto del proyecto

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran (francowerner.dev@gmail.com)
- **Fase:** context

## Contexto

Se necesita establecer las bases arquitectónicas del paquete `app/api` antes de escribir código, para que las convenciones queden registradas y verificables (no implícitas en la cabeza del autor). El repo `crm` es un monorepo en intención con dos paquetes (`app/api` backend, `app/ui` frontend); al momento del bootstrap ambos directorios están vacíos (greenfield puro, sin manifests).

## Decisión

- **Tipo de proyecto:** API REST para un CRM (dominio: clientes, deals, actividades, pipeline, permisos).
- **Stack:** Bun (runtime + package manager + test runner + bundler) · Hono (framework web minimalista) · TypeScript (strict). Ver `tech/INDEX.md`.
- **Tamaño de equipo:** 1 (solo dev). Las bases escritas son para el dev futuro y para Claude.
- **Madurez:** Greenfield (sin código previo).
- **Multi-paquete:** las convenciones de `app/api` son autónomas; no se heredan de/a `app/ui`. El `CLAUDE.md` raíz solo enruta.

## Alternativas consideradas

- **API GraphQL / gRPC:** descartadas; un CRM con frontend web propio se modela bien como REST y habilita RFC 7807.
- **Node + NestJS / Express / Python FastAPI / Go:** descartadas a favor de Bun + Hono (ver `tech/bun.md`, `tech/hono.md`).

## Consecuencias

**Positivas:**
- Defaults claros para fases siguientes (REST → RFC 7807, validación en bordes).
- Stack minimalista: control total, tooling unificado.

**Negativas / trade-offs:**
- Hono no provee estructura ni DI → la arquitectura es responsabilidad nuestra (ver `architecture-style.md`, `layers-and-dependencies.md`, `dependency-injection.md`).
- Stack nuevo (decisión de aprendizaje): curva inicial asumida conscientemente.

## Reglas concretas (si aplica)

- Todo ADR de este paquete vive en `app/api/.claude/adr/`. No se generan ADRs en la raíz del repo.
