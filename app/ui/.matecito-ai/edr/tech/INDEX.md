# Catálogo de tecnologías — app/ui

Registro vivo de las tecnologías concretas elegidas para este paquete. Cada entrada apunta a un mini-EDR con el "por qué" y alternativas descartadas.

**Para Claude:** consultá esta tabla antes de sugerir agregar una nueva dependencia. Si lo que vas a agregar pisa con algo ya elegido, **no lo agregues sin preguntar**.

## Por categoría

### Lenguaje y runtime / tooling
| Tech | Versión | Por qué |
|---|---|---|
| [bun](bun.md) | latest / sin pinear | Package manager + runner; consistencia de tooling con `app/api` |
| [typescript](typescript.md) | latest / sin pinear | Tipado estático; imprescindible para aprovechar los tipos de kubb |

### Framework UI / build
| Tech | Versión | Por qué |
|---|---|---|
| [react](react.md) | latest estable | Ecosistema CRM (tablas/forms) + mejor soporte de kubb |
| [vite](vite.md) | latest estable | Build/dev server estándar para SPA, corre sobre Bun |

### Estilos / Design System
| Tech | Versión | Por qué |
|---|---|---|
| [tailwindcss](tailwindcss.md) | v4 / sin pinear | Utility-first CSS-first (`@theme`); tokens en CSS, encaja con el handoff |
| [shadcn](shadcn.md) | latest (CLI) | Componentes copy-paste sobre Radix; código propio, custom total según handoff |
| [radix-ui](radix-ui.md) | ^1.4.3 | Primitivos accesibles base de shadcn; se adopta el paquete paraguas (import desde `"radix-ui"`) en vez de los individuales |
| [sonner](sonner.md) | ^2.0.7 | Toasts (shadcn deprecó su Toast propio); feedback de mutaciones y errores globales (`../runtime/error-handling.md` §4.4) |
| [react-day-picker](react-day-picker.md) | ^10.0.1 | Date picker headless; recomendado por handoff y shadcn; modos single/range; satélite: date-fns ^4.3.0 |
| [cmdk](cmdk.md) | ^1.1.1 | Base shadcn de `Command` (combobox con búsqueda y a11y); usado por el filtro `relation` con `shouldFilter={false}` (búsqueda async) |

### Routing
| Tech | Versión | Por qué |
|---|---|---|
| [tanstack-router](tanstack-router.md) | latest / sin pinear | Routing type-safe; mismo ecosistema que TanStack Query; guards vía `beforeLoad` (`../security/auth.md`); search params con zod |

### Estado de servidor / data fetching
| Tech | Versión | Por qué |
|---|---|---|
| [tanstack-query](tanstack-query.md) | latest / sin pinear | Estado de servidor (cache, revalidación, mutaciones); kubb genera hooks para esto |
| [tanstack-table](tanstack-table.md) | ^8.21.3 | Headless table engine (columnas, paginación manual, estado de tabla sin UI propia); ecosistema TanStack |

### Generación de cliente API (contrato)
| Tech | Versión | Por qué |
|---|---|---|
| [kubb](kubb.md) | latest / sin pinear | Genera tipos + cliente + hooks react-query + schemas zod desde el OpenAPI de `app/api` |

### Formularios / validación
| Tech | Versión | Por qué |
|---|---|---|
| [react-hook-form](react-hook-form.md) | latest / sin pinear | Forms performantes; integra schemas zod (de kubb) vía @hookform/resolvers |
| [zod](zod.md) | latest / sin pinear | Validación de config (startup) + forms (schemas generados por kubb) |

### Estado de cliente global
_Pendiente — React Context para lo mínimo (auth-state, tema). **Zustand** queda Pending (ver `../structure/inter-layer-communication.md` §3.2), trigger: el estado de cliente global crece._

### Testing
_Pendiente de decidir — ver `../delivery/testing-strategy.md` (Pending). Conflicto activo con `Strict TDD Mode` (decisión de proyecto, cerrada)._

### Observabilidad / error tracking
_Pendiente de decidir — ver `../runtime/error-handling.md` §4.3 (Pending). Recomendación no adoptada: error tracker tipo Sentry._

### Enforcement de arquitectura
| Tech | Versión | Por qué |
|---|---|---|
| [dependency-cruiser](dependency-cruiser.md) | latest / sin pinear | Gate de CI autoritativo: verifica las 7 reglas del `../structure/layers-and-dependencies.md`; mismo tooling que `app/api` |
| [eslint-plugin-boundaries](eslint-plugin-boundaries.md) | latest / sin pinear | Feedback en editor de violaciones de las reglas del `../structure/layers-and-dependencies.md` (no reemplaza el gate de CI) |

### Otros
_(vacío)_

## Mantenimiento

- **Agregar tech:** crear `<nombre>.md` con el template, sumar fila en la categoría.
- **Reemplazar tech:** Status del viejo `Superseded`, crear nuevo, sacar del INDEX.
- **Actualizar versión:** editar el archivo, anotar breaking changes en Notas.
