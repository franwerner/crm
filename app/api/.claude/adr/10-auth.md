# ADR 10 — Auth

- **Status:** Accepted (con sub-decisión refresh/rotación en Pending)
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17 (se definió el transporte del token — ver Historial)
- **Decisores:** ifran
- **Fase del bootstrap:** 5.6

## Contexto

Un CRM tiene datos sensibles de clientes y, a futuro, múltiples usuarios con distintos permisos. API REST con frontend separado (`app/ui`).

## Decisión

- **Mecanismo:** **JWT simple** — solo **access token** con expiración media. Sin refresh token por ahora.
- **Transporte (definido — llena el hueco original del ADR):** el access token viaja en una **cookie `httpOnly` + `Secure` + `SameSite=Lax`** (no en header `Authorization: Bearer`, no en el body). El login responde con `Set-Cookie`; el browser la reenvía automáticamente. El middleware de Hono lee el token **desde la cookie**.
- **Topología:** `app/api` y `app/ui` se sirven en el **mismo sitio** (mismo dominio o subdominio). Es premisa de la estrategia de cookie/CSRF.
- **CSRF:** mitigado por `SameSite=Lax` (corta el envío de la cookie en requests cross-site para los métodos que mutan). **No** se usa token anti-CSRF mientras se mantenga la topología same-site. Si en el futuro se pasa a cross-origin, este punto se reabre (token anti-CSRF + `SameSite=None;Secure` pasan a ser obligatorios).
- **Modelo de permisos:** **RBAC básico** (roles, ej: admin / vendedor). No ABAC.
- **Dónde se valida:** **un middleware único de Hono** (coherente con el patrón "un solo punto" usado en errores). El middleware verifica el token y resuelve el rol; los handlers no validan auth a mano.
- **Tecnología:** sin dependencia externa — `hono/jwt` (firma/verificación, viene con Hono) + `Bun.password` (hashing, nativo de Bun). Coherente con el stack minimalista. No se registra tech nueva.

> **Sub-decisión Pending — Refresh token + rotación.**
> Status: Pending. Trigger: *cuando sesiones largas o revocación de credenciales sean un requisito real*. Mientras tanto: solo access token con expiración media.

## Alternativas consideradas

- **JWT access+refresh+rotación + RBAC desde ya:** recomendado por el asistente; no elegido (se difiere refresh).
- **Auth completo Pending:** no elegido (se define el núcleo ahora).
- **Sessions / OAuth / proveedor de identidad externo (Auth0/Keycloak):** descartados/no requeridos en esta etapa; un proveedor de identidad sería una decisión nueva si surge.

## Consecuencias

**Positivas:** auth funcional con cero dependencias nuevas; validación centralizada; RBAC simple y suficiente.

**Negativas / trade-offs:** sin refresh, sesiones cortas o re-login más frecuente; sin revocación fina hasta resolver el Pending. La cookie `httpOnly` canjea riesgo de robo de token por XSS (eliminado) por exposición a CSRF (mitigado por `SameSite`, válido solo mientras la topología sea same-site).

## Reglas concretas

- La validación de auth vive en un único middleware Hono. Prohibido validar token/rol manualmente en handlers.
- Passwords hasheados con `Bun.password` (nunca en texto plano, nunca logueados — ver ADR 04 §4.5).
- Tokens firmados/verificados con `hono/jwt`. El secret de JWT viene del módulo de config validado (ADR 08).
- El token se emite vía `Set-Cookie` (`httpOnly; Secure; SameSite=Lax; Path=/`) en el endpoint de login y se limpia en el de logout. El middleware lee el token de la cookie, NUNCA de un header `Authorization`.
- Atributos de la cookie (nombre, dominio, max-age, `Secure` por entorno) salen del módulo de config validado (ADR 08), no hardcodeados.
- CORS configurado para el mismo sitio con `credentials` habilitado; orígenes permitidos vienen de config (ADR 08). No usar `*` con credentials.
- Premisa registrada: same-site. Pasar a cross-origin reabre esta decisión (CSRF token + `SameSite=None`).
- Autorización por rol (RBAC); las reglas de qué rol puede qué se documentan en el slice correspondiente.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial. JWT simple sin refresh; refresh+rotación Pending con trigger | ifran |
| 2026-05-17 | Llenado del hueco de transporte: cookie httpOnly+Secure+SameSite=Lax, topología same-site, CSRF vía SameSite, CORS con credentials. Disparado al bootstrapear app/ui (decisión cross-paquete) | ifran |
