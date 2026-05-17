# react-hook-form (+ @hookform/resolvers, @kubb/plugin-zod)

- **Categoría:** Formularios / validación cliente
- **Versión:** latest / sin pinear (greenfield — pinear con caret al inicializar)
- **Status:** Accepted
- **Decidido en fase:** 3.4
- **Fecha:** 2026-05-17

## Por qué la elegimos

Manejo de formularios performante (uncontrolled, pocos re-renders) — importante en un CRM lleno de forms. Se integra con schemas zod vía `@hookform/resolvers`. Los schemas zod NO se escriben a mano: los genera `@kubb/plugin-zod` desde el OpenAPI de `app/api`, así la validación cliente deriva del mismo contrato que valida el backend (fuente única de verdad, ver `app/api` ADR 03 §3.4 y ADR 12).

## Alternativas descartadas

- **Formik:** más re-renders y API más vieja.
- **zod escrito a mano para forms:** se desincroniza del contrato del backend; hay que mantenerlo en paralelo.
- **Solo errores del API (sin validación cliente):** UX peor (round-trip por cada error).

## Notas

- Pipeline: `@kubb/plugin-zod` genera los schemas → `@hookform/resolvers/zod` los conecta a react-hook-form. Los schemas generados son artefacto (read-only), no editar a mano.
- La validación cliente es para UX (feedback inmediato). La fuente de verdad de validación es la API (`app/api`). El front no asume que su validación es suficiente.
- Errores que sí o sí vienen del server (ej: "email ya existe") se muestran desde la respuesta RFC 7807 de la API, no se pueden validar localmente.
