# Dominio: security — Índice

**Criterio de pertenencia:** EDRs sobre seguridad del frontend: autenticación, transporte de credenciales (cookie httpOnly), estado de sesión, protección de rutas y CSRF.

| EDR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [auth.md](auth.md) | Accepted | Auth | Toques login/logout, protección de rutas, estado de sesión, manejo de 401. |

## No aplican (N/A)

Concerns que la matriz marca relevantes para `web-spa` pero sin EDR propio en esta etapa.

| Concern | Razón |
|---|---|
| authorization | Cubierto por route guards + estado de sesión (ver `auth.md` y `../frontend/routing.md`); sin modelo de roles todavía. |
| input-validation | Cubierto por validación `zod` en forms (ver `../structure/inter-layer-communication.md`); sin EDR propio. |
| dependency-scanning | Sin pipeline de seguridad de dependencias todavía. |
