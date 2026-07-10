# EDR — Auth (app/ui)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase:** auth

## Contexto

Decisión cross-paquete tomada en conjunto con `app/api` `auth.md` (que originalmente NO definía el transporte del token — hueco detectado al bootstrapear `app/ui` y resuelto). Topología: `app/api` y `app/ui` se sirven en el **mismo sitio**.

## Decisión

- **Transporte:** el access token viaja en una **cookie `httpOnly` + `Secure` + `SameSite=Lax`** seteada por `app/api`. El browser la reenvía sola.
- **El front NO toca el token:** no lo almacena (ni localStorage, ni memoria), no lo lee, no lo adjunta. No hay interceptor de `Authorization`. El token es invisible para el JS (httpOnly) → inmune a robo por XSS.
- **Cliente kubb:** configurado con `credentials: 'include'` para que la cookie viaje (same-site, sin CORS complejo).
- **Estado de sesión:** el front NO decodifica el token. Pregunta al server: un endpoint tipo `GET /me` (200 = sesión válida → user/rol; 401 = a login). Ese estado vive en un Context de auth en `src/app/`.
- **Protección de rutas:** guard en `src/app/` basado en el estado de auth (query a `/me`). Rutas privadas redirigen a login si 401.
- **401 global:** (`../runtime/error-handling.md` §4.1) al recibir 401 → limpiar auth-state y redirigir a login.
- **Logout:** endpoint de `app/api` que limpia la cookie; el front invalida el estado de auth y las queries.
- **CSRF:** mitigado por `SameSite` del lado de `app/api`. Mientras la topología sea same-site, el front NO necesita manejar token anti-CSRF.

## Alternativas consideradas

- Token en localStorage + Bearer — descartado: expone a robo por XSS y obliga a manejar storage.
- Token en memoria + re-login al refrescar — peor UX (sin refresh token en `app/api` `auth.md`).
- Cross-origin — descartado: obligaría `SameSite=None` + token anti-CSRF; topología elegida es same-site.

## Consecuencias

**Positivas:** el front no gestiona tokens (más simple y más seguro); inmune a robo de token por XSS; auth-state explícito vía `/me`.

**Negativas / trade-offs:**
- Sin refresh token en `app/api` (`auth.md` sub-Pending) → sesiones más cortas / re-login más frecuente. Impacta UX acá; se resuelve del lado de `app/api`.
- Premisa same-site: si se pasa a cross-origin, se reabre (CSRF token + `SameSite=None`).

## Reglas concretas

- Prohibido leer/guardar/adjuntar el token en el front. La cookie la maneja el browser.
- Cliente kubb con `credentials: 'include'`.
- "¿Estoy logueado?" se responde con la query a `/me`, NUNCA decodificando un token.
- Guard de rutas y manejo de 401 centralizados en `src/app/` (no por componente).
- Logout = llamar al endpoint de `app/api` + invalidar auth-state y queries.
