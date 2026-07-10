# Dominio: `security` — Decisiones

Seguridad: autenticación/autorización, transporte de credenciales, CSRF, y manejo de secretos (cómo se aprovisionan y protegen las credenciales del sistema).

## EDRs en este dominio

| EDR | Status | Type | Consultá cuando... |
|---|---|---|---|
| [auth.md](auth.md) | Accepted | decision | Toques login, permisos, tokens, o el middleware de autorización. |
| [secrets-management.md](secrets-management.md) | Accepted | policy | Aprovisiones o consumas un secreto (JWT secret, credenciales de DB/storage); evalúes introducir un secret manager. Hermano de `../delivery/configuration.md`. |

## No aplican en este dominio

| Concern | Razón |
|---|---|
| authorization | Autorización hoy binaria (autenticado / no); sin modelo de roles ni permisos finos todavía. |
| input-validation | Cubierto por validación de schemas en el borde HTTP (ver `../contracts/api-contract.md`); sin EDR propio. |
| cors | Configurado vía middleware con orígenes desde el módulo de config (ver `../delivery/configuration.md`); sin EDR propio. |
| rate-limiting | Sin exposición pública todavía (consumida solo por el frontend); reconsiderar al exponer la API. |
| dependency-scanning | Sin pipeline de seguridad de dependencias en esta etapa. |

**Leyenda de status:** `Accepted` · `Pending` · `Not Applicable` · `Deferred` · `Superseded`.
