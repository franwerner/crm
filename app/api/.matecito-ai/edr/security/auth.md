# EDR — Auth

- **Status:** Accepted
- **Type:** decision
- **Date:** 2026-05-17

## Contexto

Un CRM tiene datos sensibles de clientes y, a futuro, múltiples usuarios con distintos permisos. Es una API REST con frontend separado, servidos en el mismo sitio.

## Decisión

- **Mecanismo:** JWT simple — solo access token con expiración media. Sin refresh token por ahora.
- **Transporte:** el access token viaja en una cookie `httpOnly` + `Secure` + `SameSite=Lax` (no en header `Authorization: Bearer`, no en el body). El login responde con `Set-Cookie`; el browser la reenvía automáticamente. El middleware de auth lee el token desde la cookie.
- **Topología:** API y frontend se sirven en el mismo sitio (mismo dominio o subdominio). Es premisa de la estrategia de cookie/CSRF.
- **CSRF:** mitigado por `SameSite=Lax` (corta el envío de la cookie en requests cross-site para los métodos que mutan). No se usa token anti-CSRF mientras se mantenga la topología same-site. Pasar a cross-origin reabre este punto (token anti-CSRF + `SameSite=None;Secure` pasan a ser obligatorios).
- **Modelo de permisos:** sin roles. El producto decidió que todos los usuarios tienen exactamente las mismas capacidades. No hay RBAC ni atributo de rol en el usuario. Auth en el MVP = autenticación (login/logout) sin autorización por roles.
- **Dónde se valida:** un único middleware de auth (coherente con el patrón "un solo punto" usado en errores). El middleware verifica el token; los handlers no validan auth a mano. No hay resolución de rol porque no hay roles.
- **Tecnología:** sin dependencia externa — la firma/verificación de JWT viene con el framework web (Hono) y el hashing de passwords es nativo de Bun. Coherente con el stack minimalista; no se registra tech nueva.

## Razón de omisión / aplazamiento — sub-decisión Refresh token + rotación

**Status:** Pending

Trigger: cuando sesiones largas o la revocación fina de credenciales sean un requisito real. Mientras tanto, solo access token con expiración media; sin refresh ni rotación.

## Alcance

- `src/**/*.middleware.ts` (o el middleware de auth único) — verificación del token; ningún handler valida auth a mano.

## Reglas verificables

- **[manual]** La validación de auth vive en un único middleware; prohibido validar el token manualmente en los handlers. No existe validación de rol porque no hay roles.
- **[manual]** Los passwords se hashean con el hashing nativo de Bun; nunca en texto plano, nunca logueados (ver [../runtime/error-handling.md](../runtime/error-handling.md)).
- **[manual]** Los tokens se firman/verifican con el JWT del framework web; el secret de JWT viene del módulo de config validado (ver [../delivery/configuration.md](../delivery/configuration.md)).
- **[manual]** El token se emite vía `Set-Cookie` (`httpOnly; Secure; SameSite=Lax; Path=/`) en login y se limpia en logout. El middleware lee el token de la cookie, nunca de un header `Authorization`.
- **[manual]** Los atributos de la cookie (nombre, dominio, max-age, `Secure` por entorno) salen del módulo de config validado, no hardcodeados.
- **[manual]** CORS configurado para el mismo sitio con `credentials` habilitado; orígenes permitidos desde config. No usar `*` con credentials.

## Alternativas consideradas

- **JWT access+refresh+rotación + RBAC desde ya:** recomendado por el asistente; no elegido (se difiere refresh y el producto descartó roles).
- **Auth completo Pending:** no elegido (se define el núcleo ahora).
- **Sessions / OAuth / proveedor de identidad externo (Auth0/Keycloak):** descartados/no requeridos en esta etapa; un proveedor de identidad sería una decisión nueva si surge.

## Consecuencias

**Positivas:** auth funcional con cero dependencias nuevas; validación centralizada; sin la complejidad de RBAC que el producto no necesita.

**Negativas / trade-offs:** sin refresh, sesiones cortas o re-login más frecuente; sin revocación fina hasta resolver el Pending. La cookie `httpOnly` canjea el riesgo de robo de token por XSS (eliminado) por exposición a CSRF (mitigado por `SameSite`, válido solo mientras la topología sea same-site). RBAC descartado por decisión explícita de producto; si en el futuro se necesitan roles, será un EDR nuevo.

## Relacionados

- `depende-de` → [../delivery/configuration.md](../delivery/configuration.md) — el secret de JWT y los atributos de la cookie salen del módulo de config validado.
- `relacionado-con` → [secrets-management.md](secrets-management.md) — el secret de firma de JWT es uno de los secretos que esa política gobierna.
