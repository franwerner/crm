# Catálogo de tecnologías — app/ui

Registro vivo de las tecnologías concretas elegidas para este paquete. Cada entrada apunta a un mini-ADR con el "por qué" y alternativas descartadas.

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

### Estado de servidor / data fetching
| Tech | Versión | Por qué |
|---|---|---|
| [tanstack-query](tanstack-query.md) | latest / sin pinear | Estado de servidor (cache, revalidación, mutaciones); kubb genera hooks para esto |

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
_Pendiente — React Context para lo mínimo (auth-state, tema). **Zustand** queda Pending (ver `03-inter-layer-communication.md` §3.2), trigger: el estado de cliente global crece._

### Testing
_Pendiente de decidir — ver `06-testing-strategy.md` (Pending). Conflicto activo con `Strict TDD Mode` (decisión de proyecto, cerrada)._

### Observabilidad / error tracking
_Pendiente de decidir — ver `04-error-handling.md` §4.3 (Pending). Recomendación no adoptada: error tracker tipo Sentry._

### Enforcement de arquitectura
| Tech | Versión | Por qué |
|---|---|---|
| [dependency-cruiser](dependency-cruiser.md) | latest / sin pinear | Gate de CI autoritativo: verifica las 7 reglas del ADR 02; mismo tooling que `app/api` |
| [eslint-plugin-boundaries](eslint-plugin-boundaries.md) | latest / sin pinear | Feedback en editor de violaciones de las reglas del ADR 02 (no reemplaza el gate de CI) |

### Otros
_(vacío)_

## Mantenimiento

- **Agregar tech:** crear `<nombre>.md` con el template, sumar fila en la categoría.
- **Reemplazar tech:** Status del viejo `Superseded`, crear nuevo, sacar del INDEX.
- **Actualizar versión:** editar el archivo, anotar breaking changes en Notas.
