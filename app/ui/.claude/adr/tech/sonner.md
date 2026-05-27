# sonner

- **Categoría:** Estilos / Design System (feedback / toasts)
- **Versión:** ^2.0.7
- **Status:** Accepted
- **Decidido en fase:** error-handling §4.4
- **Fecha:** 2026-05-24

## Por qué la elegimos

Librería de toasts recomendada por shadcn (que deprecó su `Toast` propio). Cubre el feedback de mutaciones sin form visible y errores globales (`error-handling.md` §4.4). Liviana, accesible y fácil de estilar con tokens.

## Alternativas descartadas

- **Toast propio de shadcn:** deprecado en favor de sonner.
- **react-hot-toast / react-toastify:** sonner es el estándar actual del ecosistema shadcn y más simple de calzar con la identidad.

## Notas

- Wrapper estilado con la identidad (borde negro 1.5px + `shadow-brutal-md`) en `src/shared/ui/sonner.tsx`. Montado una vez en `src/app/providers.tsx`.
- Los mensajes salen del adaptador RFC 7807 (`toUserMessage`, `error-handling.md` §4.2).
