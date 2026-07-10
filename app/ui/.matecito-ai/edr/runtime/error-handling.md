# EDR — Manejo de errores (app/ui)

- **Status:** Accepted (con §4.3 observabilidad en Pending)
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-24
- **Decisores:** ifran
- **Fase:** error-handling

## Contexto

Una SPA tiene tres clases de error distintas que se manejan diferente: render/runtime, llamadas a la API, y errores de negocio del backend (RFC 7807).

## Decisión

### 4.1 — Arquitectura
- **Render/runtime:** **React Error Boundary global + uno por ruta de feature** (un feature roto no tumba toda la app).
- **Errores de API:** estado de error de TanStack Query por hook.
- **Transversales:** manejo global de `401` (→ limpiar auth-state y redirigir a login) en el cliente de kubb / configuración del QueryClient.

### 4.2 — RFC 7807
**Adaptador centralizado en `src/shared/lib`.** Un solo módulo mapea `application/problem+json` → mensaje de UI, y el array de errores de campo (ver `app/api` `error-handling.md` §4.4 / `api-contract.md`) → `setError` de react-hook-form. Todas las features lo usan. Garantiza consistencia y coherencia con el contrato de error de `app/api`.

### 4.3 — Observabilidad *(Pending)*
Ver "Razón de aplazamiento".

### 4.4 — Presentación de errores (inline vs toast)
Regla rectora: **el error vive donde el usuario lo puede resolver.**
- **Validación de campo** (zod / react-hook-form) → **inline en el campo** (`aria-invalid` en el `Input` + mensaje).
- **Error al enviar un form** (credenciales inválidas, conflictos 409, etc.) → **inline a nivel de form**. NO toast.
- **Mutaciones sin form visible** (acciones desde botón/tabla: borrar, cambiar estado, registrar evento) → **toast** (`sonner`).
- **Errores globales / inesperados** (5xx, red) y **éxitos de acciones puntuales** → **toast**.
- **401** → redirect a login (§4.1), nunca toast.

Todos los mensajes salen del adaptador RFC 7807 (`toUserMessage`, §4.2). El `<Toaster>` (sonner, estilado con la identidad en `shared/ui/sonner.tsx`) se monta una vez en `app/` (`providers.tsx`). Ver `../tech/sonner.md`.

## Razón de omisión / aplazamiento (§4.3)

**Status:** Pending. Sin error tracker (Sentry-like) por ahora. En dev: errores a consola del navegador. Coherente con `app/api` `logging.md` (logging diferido).
- **Trigger:** cuando se opere en producción con usuarios reales.
- **Riesgo asumido:** sin visibilidad de errores en prod hasta resolverlo.

## Alternativas consideradas

- 4.1: solo boundary global — un error de render tumba toda la app.
- 4.2: parseo por feature / detail crudo — inconsistente, UX pobre.
- 4.3: error tracker desde ya — setup + dependencia, no elegido en greenfield.

## Consecuencias

**Positivas:** fallos aislados por feature; manejo de error de API consistente; integración 7807↔forms en un solo lugar.

**Negativas / trade-offs:** sin observabilidad en prod hasta resolver §4.3.

## Reglas concretas

- Error Boundary en la raíz (`app/`) y uno por ruta de feature.
- Todo error de API se interpreta vía el adaptador RFC 7807 de `shared/lib`, no ad-hoc.
- `401` se maneja globalmente (logout + redirect), no por componente.
