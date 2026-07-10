# EDR — Contexto del proyecto

- **Status:** Accepted
- **Type:** decision
- **Date:** 2026-05-17

## Contexto

Se necesita establecer las bases arquitectónicas del paquete `app/api` antes de escribir código, para que las convenciones queden registradas y verificables (no implícitas en la cabeza del autor). El repo `crm` es un monorepo en intención con dos paquetes (backend y frontend); al momento del bootstrap ambos directorios están vacíos (greenfield puro, sin manifests).

## Decisión

- **Tipo de proyecto:** API REST para un CRM (dominio: clientes, deals, actividades, pipeline, permisos).
- **Stack:** Bun (runtime + package manager + test runner + bundler) · Hono (framework web minimalista) · TypeScript (strict).
- **Tamaño de equipo:** 1 (solo dev). Las bases escritas son para el dev futuro y para Claude.
- **Madurez:** Greenfield (sin código previo).
- **Multi-paquete:** las convenciones de `app/api` son autónomas; no se heredan de ni hacia el paquete de frontend. El `CLAUDE.md` raíz solo enruta.

## Alternativas consideradas

- **API GraphQL / gRPC:** descartadas; un CRM con frontend web propio se modela bien como REST y habilita RFC 7807.
- **Node + NestJS / Express / Python FastAPI / Go:** descartadas a favor de Bun + Hono.

## Consecuencias

**Positivas:**
- Defaults claros para fases siguientes (REST → RFC 7807, validación en bordes).
- Stack minimalista: control total, tooling unificado.

**Negativas / trade-offs:**
- Hono no provee estructura ni DI → la arquitectura es responsabilidad nuestra.
- Stack nuevo (decisión de aprendizaje): curva inicial asumida conscientemente.

## Relacionados

- `relacionado-con` → [../tech/INDEX.md](../tech/INDEX.md) — catálogo de tecnologías elegidas (Bun, Hono).
- `relacionado-con` → [../structure/architecture-style.md](../structure/architecture-style.md) — el estilo arquitectónico que Hono deja a nuestro cargo.
- `relacionado-con` → [../structure/layers-and-dependencies.md](../structure/layers-and-dependencies.md) — capas y reglas de dependencia.
- `relacionado-con` → [../delivery/dependency-injection.md](../delivery/dependency-injection.md) — la DI que Hono no provee.
