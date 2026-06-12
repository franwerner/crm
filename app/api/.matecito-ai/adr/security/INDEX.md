# Dominio: security — Índice

**Criterio de pertenencia:** ADRs sobre seguridad: autenticación/autorización, transporte de credenciales, CSRF, y manejo de secretos (cómo se aprovisionan y protegen las credenciales del sistema).

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [auth.md](auth.md) | Accepted | Auth | Toques login, permisos, tokens, middleware de autorización. |
| [secrets-management.md](secrets-management.md) | Accepted | Manejo de secretos | Aprovisiones o consumas un secreto (JWT secret, credenciales de DB/storage); evalúes introducir un secret manager. Hermano de `../delivery/configuration.md`. |

## No aplican (N/A)

Concerns que la matriz marca relevantes para `api-rest` pero sin ADR propio en esta etapa.

| Concern | Razón |
|---|---|
| authorization | Autorización hoy binaria (autenticado / no); sin modelo de roles ni permisos finos todavía. |
| input-validation | Cubierto por schemas `zod` en el borde HTTP (ver `../contracts/api-contract.md`); sin ADR propio. |
| cors | Configurado vía middleware con origins desde el módulo de config (ver `../delivery/configuration.md`); sin ADR propio. |
| rate-limiting | Sin exposición pública todavía (consumida solo por `app/ui`); reconsiderar al exponer la API. |
| dependency-scanning | Sin pipeline de seguridad de dependencias en esta etapa. |
