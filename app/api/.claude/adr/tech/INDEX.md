# Catálogo de tecnologías — app/api

Registro vivo de las tecnologías concretas elegidas para este paquete. Cada entrada apunta a un mini-ADR con el "por qué" y alternativas descartadas.

**Para Claude:** consultá esta tabla antes de sugerir agregar una nueva dependencia. Si lo que vas a agregar pisa con algo ya elegido, **no lo agregues sin preguntar**.

## Por categoría

### Lenguaje y runtime
| Tech | Versión | Por qué (resumen) |
|---|---|---|
| [bun](bun.md) | latest / sin pinear | Runtime + package manager + test runner + bundler en uno; rápido; target edge; decisión de aprendizaje |
| [typescript](typescript.md) | latest / sin pinear | Tipado estático; contratos entre capas; Bun ejecuta TS nativo |

### Framework principal
| Tech | Versión | Por qué |
|---|---|---|
| [hono](hono.md) | latest / sin pinear | Framework HTTP minimalista y rápido; sin DI/estructura impuesta; portable a edge |

### Base de datos
| Tech | Versión | Por qué |
|---|---|---|
| [postgresql](postgresql.md) | latest estable | CRM = datos relacionales con integridad fuerte; ACID, constraints, joins |

### ORM / Acceso a datos
| Tech | Versión | Por qué |
|---|---|---|
| [drizzle](drizzle.md) | latest / sin pinear | ORM SQL-first type-safe + drizzle-kit (migraciones); first-class en Bun; minimalista |

### Object storage
| Tech | Versión | Por qué |
|---|---|---|
| [minio](minio.md) | latest (image tag, sin pinear — decisión consciente para dev) | S3-compatible auto-hosteado para dev; mismo cliente `Bun.s3` nativo funciona contra MinIO o AWS S3 cambiando endpoint. ADR 19 |

### Validación
| Tech | Versión | Por qué |
|---|---|---|
| [zod](zod.md) | latest / sin pinear | Validación de forma/tipos en el borde + inferencia TS; adapter oficial de Hono. Reusado en config (ADR 08) |

### Testing
_Pendiente de decidir — ver `06-testing-strategy.md` (Status: Pending). Conflicto activo con `Strict TDD Mode` del harness._

### Logging
_Pendiente de decidir — ver `07-logging.md` (Status: Pending). Recomendación no adoptada: `pino`._

### Configuración / Secretos
| Tech | Versión | Por qué |
|---|---|---|
| [zod](zod.md) | (ver Validación) | Schema de config validado al startup en `src/shared/config` (ADR 08) |

### Auth
_Sin dependencia externa — se usan `hono/jwt` (parte de Hono) y `Bun.password` (nativo de Bun). Ver `10-auth.md`. Refresh/rotación: Pending._

### Inyección de dependencias
_Sin librería — DI manual en el composition root. Ver `05-dependency-injection.md`._

### Documentación / Contrato de API
| Tech | Versión | Por qué |
|---|---|---|
| [hono-zod-openapi](hono-zod-openapi.md) | latest / sin pinear | Schema zod del borde = validación + OpenAPI 3.x autogenerado (fuente única de verdad). ADR 12 |
| [scalar-hono-api-reference](scalar-hono-api-reference.md) | latest / sin pinear | UI de docs moderna para humanos sobre el mismo spec. ADR 12 |

> **kubb** NO se registra acá: es consumidor del OpenAPI y vive en `app/ui` (se registra en su catálogo cuando se bootstrapee ese paquete). Ver `12-api-documentation.md`.

### Enforcement de arquitectura
| Tech | Versión | Por qué |
|---|---|---|
| [dependency-cruiser](dependency-cruiser.md) | latest / sin pinear | Verifica las 7 reglas del ADR 02 como globs de path; gate de CI obligatorio |

### Otros
| Tech | Versión | Por qué |
|---|---|---|
| [uuidv7](uuidv7.md) | 1.2.1 | Genera UUID v7 RFC 9562 (time-ordered); monotonicidad sub-ms; cero deps. Único generador de identidad sancionado vía `src/shared/id` |

## Mantenimiento

- **Agregar tech:** crear `<nombre>.md` con el template, sumar fila en la categoría correspondiente.
- **Reemplazar tech:** marcar Status del viejo como `Superseded`, crear nuevo, sacar del INDEX el viejo (o moverlo a "Históricas").
- **Actualizar versión:** editar el archivo, anotar en Notas si hay breaking changes.
