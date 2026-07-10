# Catálogo de tecnologías — app/api

Registro vivo de las tecnologías concretas elegidas para este paquete. Cada entrada apunta a un mini-EDR con el "por qué" y alternativas descartadas.

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
| [minio](minio.md) | latest (image tag, sin pinear) | S3-compatible auto-hosteado para dev; mismo cliente `Bun.s3` nativo contra MinIO o AWS S3 cambiando endpoint |

### Validación
| Tech | Versión | Por qué |
|---|---|---|
| [zod](zod.md) | latest / sin pinear | Validación de forma/tipos en el borde + inferencia TS; adapter oficial de Hono. Reusado en config |
| [libphonenumber-js](libphonenumber-js.md) | latest / sin pinear | Normalización de teléfonos a E.164; puro JS sin deps nativas; funciona en Bun. Usar `/min` |

### Testing
_Pendiente de decidir — ver `../delivery/testing-strategy.md` (Status: Pending)._

### Logging
| Tech | Versión | Por qué (resumen) |
|---|---|---|
| [pino](pino.md) | ^10.3.1 (+ pino-pretty ^13.1.3) | Logger JSON estructurado de bajo overhead; detrás de la interface `Logger` en `src/shared/logger` |

### Background jobs / Cola
| Tech | Versión | Por qué (resumen) |
|---|---|---|
| [redis](redis.md) | 7-alpine | Backing store de BullMQ para colas durables + cache MX del checker de canales |
| [bullmq](bullmq.md) | ^5.78.1 | Cola sobre Redis con retry/backoff/DLQ/repeatable |
| [ioredis](ioredis.md) | ^5.11.1 | Cliente Redis que BullMQ exige; riesgo Bun documentado |

### Configuración / Secretos
| Tech | Versión | Por qué |
|---|---|---|
| [zod](zod.md) | (ver Validación) | Schema de config validado al startup en `src/shared/config` |

### Auth
_Sin dependencia externa — se usan `hono/jwt` (parte de Hono) y `Bun.password` (nativo de Bun). Ver `../security/auth.md`._

### Inyección de dependencias
_Sin librería — DI manual en el composition root. Ver `../delivery/dependency-injection.md`._

### Documentación / Contrato de API
| Tech | Versión | Por qué |
|---|---|---|
| [hono-zod-openapi](hono-zod-openapi.md) | latest / sin pinear | Schema zod del borde = validación + OpenAPI 3.x autogenerado (fuente única de verdad) |
| [scalar-hono-api-reference](scalar-hono-api-reference.md) | latest / sin pinear | UI de docs moderna para humanos sobre el mismo spec |

> **kubb** NO se registra acá: es consumidor del OpenAPI y vive en `app/ui` (se registra en su catálogo cuando se bootstrapee ese paquete).

### Enforcement de arquitectura
| Tech | Versión | Por qué |
|---|---|---|
| [dependency-cruiser](dependency-cruiser.md) | latest / sin pinear | Verifica las reglas de `../structure/layers-and-dependencies.md` como globs de path; gate de CI obligatorio |

### Parseo de archivos
| Tech | Versión | Por qué |
|---|---|---|
| [exceljs](exceljs.md) | 4.4.0 | Parseo XLSX en streaming (`WorkbookReader`) con RAM constante ~180 MB. Spike-validado sobre Bun. Usado por `imports` |

### LLM gateway
| Tech | Versión | Por qué |
|---|---|---|
| [openrouter](openrouter.md) | dep `openai` latest / sin pinear | Gateway LLM OpenAI-compatible; auto-router `openrouter/free` gestiona selección/rotación de modelos internamente |

### Otros
| Tech | Versión | Por qué |
|---|---|---|
| [uuidv7](uuidv7.md) | 1.2.1 | Genera UUID v7 RFC 9562 (time-ordered); monotonicidad sub-ms; cero deps. Único generador de identidad vía `src/shared/id` |

## Mantenimiento

- **Agregar tech:** crear `<nombre>.md` con el template, sumar fila en la categoría correspondiente.
- **Reemplazar tech:** marcar Status del viejo como `Superseded`, crear nuevo, sacar del INDEX el viejo (o moverlo a "Históricas").
- **Actualizar versión:** editar el archivo, anotar en Notas si hay breaking changes.
