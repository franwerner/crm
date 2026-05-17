# CRM — Multi-package conventions

Este repo contiene múltiples paquetes, cada uno con sus propias decisiones arquitectónicas independientes.

**Antes de trabajar en código de un paquete específico:**
1. Identificá en qué paquete estás (mirá el path del archivo).
2. Leé `<paquete>/.claude/adr/INDEX.md` para las convenciones de ese paquete.
3. Leé `<paquete>/.claude/adr/tech/INDEX.md` antes de instalar dependencias en ese paquete.

**Importante:** las convenciones NO se heredan entre paquetes. Lo que vale en `app/api` no necesariamente vale en `app/ui`.

## Paquetes registrados

| Paquete | Stack | Convenciones |
|---|---|---|
| [app/api](app/api/.claude/adr/INDEX.md) | Bun + Hono + TypeScript (API REST) | ver INDEX |
| [app/ui](app/ui/.claude/adr/INDEX.md) | Bun + React + Vite + TanStack Query + kubb (SPA) | ver INDEX |

## Contrato compartido entre paquetes

Lo único que comparten `app/api` y `app/ui` es el **contrato OpenAPI**: `app/api` lo autogenera (su ADR 12) y `app/ui` lo consume con kubb (su ADR 09). **Auth es cross-paquete**: cookie `httpOnly` same-site definida en conjunto (`app/api` ADR 10 ↔ `app/ui` ADR 10). Cualquier cambio en el contrato o en auth debe revisarse en AMBOS paquetes.

## Paquetes sin ADRs

_Ninguno — todos los paquetes del repo están bootstrapeados._

Para crear/actualizar las convenciones de un paquete, usá la skill `architecture-boostrap` desde el directorio raíz del paquete (o decile a Claude qué paquete tocar).
