# PRD — CRM personal

| Campo | Valor |
|---|---|
| Documento | Product Requirements Document (nivel monorepo) |
| Versión | 0.3 |
| Fecha | 2026-05-17 |
| Estado | Cerrado. Mapa de transiciones confirmado. Modelado de datos implementado en `app/api`. |
| Alcance | Monorepo `crm` (`app/api` + `app/ui`) |

> Este documento define **qué** es el producto y **qué** entra en cada fase.
> Las decisiones técnicas (stack, capas, persistencia, contrato) viven en los
> `.claude/adr/` de cada paquete y NO se redefinen acá.

---

## 1. Visión

CRM de equipo chico para **cargar contactos, clasificarlos según información, y
hacerlos avanzar** de contacto a lead y de lead a cliente según cómo evolucione
la comunicación.

La comunicación real ocurre **siempre fuera del sistema y de forma manual**
(Instagram, WhatsApp, u otro canal). El CRM **no envía mensajes ni integra
canales de mensajería**: es el lugar donde se registra, clasifica y se observa
el estado de cada relación.

## 2. Usuario y contexto

- **Múltiples usuarios, un mismo rol**. Hay varias cuentas de usuario; todos
  tienen exactamente las mismas capacidades. Sin roles, sin permisos
  diferenciados.
- **Workspace único compartido (sin multi-tenant)**: todos los usuarios ven y
  operan sobre los **mismos datos** (un único pool de contactos y eventos). No
  hay organizaciones ni aislamiento de datos entre usuarios.
- Equipo chico de usuarios; volumen bajo-medio de contactos.
- Autenticación: cuenta individual por usuario (login por usuario). El
  transporte ya está decidido cross-paquete (cookie `httpOnly` same-site, ver
  `auth.md` de `app/api` ↔ `app/ui`). No se redefine acá.

## 3. Objetivos

1. Centralizar todos los contactos en un solo lugar, con clasificación
   estructurada.
2. Tener **siempre visible y confiable** el estado de cada relación dentro de un
   pipeline simple.
3. Llevar un **historial de eventos** por contacto que permita decidir, con
   contexto, si avanza a lead o cliente.
4. Que el estado avance solo según reglas de negocio, sin depender de que el
   usuario se acuerde de moverlo a mano.
5. Sentar la base para una **Fase 2** de clasificación automática y
   recomendaciones.

### Fuera de objetivo (MVP)

- Automatizar o integrar mensajería (IG/WhatsApp/etc.).
- Clasificación automática por IA.
- Recomendaciones de contacto/oferta.
- Multiusuario con roles, permisos u organizaciones.
- Reglas de transición configurables por el usuario (las reglas son
  hardcodeadas — ver sección 8).

## 4. Alcance por fases

### MVP — gestión + motor de estados

- ABM de contactos.
- Clasificación con campos predefinidos (sección 6).
- Pipeline con **motor de transiciones automático de reglas hardcodeadas**
  (sección 8), con override manual.
- **Historial de eventos** por contacto (sección 7).
- **Registro de auditoría** de todo cambio de estado (sección 8).
- Listado con filtros y búsqueda.
- Cuentas de usuario y atribución (secciones 2 y 9).

### Fase 2 — inteligencia (futuro, NO en MVP)

- **Clasificador de contactos** a partir de la información y el historial.
- **Recomendaciones**: cómo contactar y qué ofrecer.
- Eventual: archivos adjuntos en eventos, reglas de transición configurables,
  campo de segmento.

> El MVP no incluye ganchos ni endpoints para Fase 2. El modelo de datos, sin
> embargo, se diseña pensado para alimentarla (eventos tipados + historial
> append-only + atribución).

## 5. Pipeline (estados)

Estado **único por contacto** en cada momento. Avanza por el motor (sección 8)
o por cambio manual.

```
Contacto ──► Lead ──► Cliente
   │           │
   └───────────┴──────► Descartado
```

| Estado | Significado |
|---|---|
| Contacto | Cargado, aún sin calificar la relación. |
| Lead | Hubo comunicación con intención/interés real. |
| Cliente | Se concretó una propuesta/venta. |
| Descartado | No hay fit, no respondió, o se cerró sin avanzar. |

- No existe estado "Perdido" separado: `Descartado` cubre ese caso.
- Un `Descartado` se puede **reactivar manualmente** (volver a `Contacto` o
  `Lead`). La reactivación es siempre manual, nunca automática.

## 6. Modelo de clasificación

Campos estructurados con valores cerrados (predefinidos por diseño).

| Campo | Valores |
|---|---|
| Canal de origen | Instagram, WhatsApp, Referido, Email, Otro |
| Nivel de interés | Frío, Tibio, Caliente |

> **Segmento queda fuera del MVP** (no hay un eje de negocio concreto que lo
> justifique hoy). Se reincorpora si aparece la necesidad real, en Fase 2.

## 7. Historial de eventos

Cada contacto tiene una **línea de tiempo de eventos** inmutable
(append-only): los eventos solo se agregan, nunca se editan ni se borran.

Cada evento: `tipo` (predefinido) + `fecha/hora` + `detalle` (texto) +
`autor` (usuario que lo registró).

### Tipos de evento (predefinidos, fijos)

| Tipo | Uso |
|---|---|
| Primer contacto | Se inició la relación. |
| Mensaje enviado | El usuario escribió al contacto. |
| Respuesta recibida | El contacto respondió. |
| Reunión / Llamada | Conversación en vivo. |
| Propuesta enviada | Se envió una oferta/propuesta. |
| Propuesta cerrada (ganada) | La propuesta se concretó. |
| Propuesta rechazada | La propuesta no prosperó. |
| Seguimiento pendiente | Recordatorio de retomar. |
| Nota | Anotación libre sin acción asociada. |

- **Detalle: solo texto.** Sin archivos adjuntos en el MVP (evita storage; es
  reversible, queda para Fase 2).

## 8. Motor de estados y observabilidad

El estado del pipeline no depende de que el usuario lo mueva a mano. El modelo
tiene dos mitades que **no se mezclan**:

### 8.1 Mitad de entrada — motor de reglas (Event → estado)

- Al registrar un Event de negocio, una regla **hardcodeada** evalúa si
  corresponde una transición de estado y, si corresponde, la aplica.
- Dirección **unidireccional**: `Event → estado`. Un cambio de estado **nunca**
  dispara el motor (si no, hay causalidad circular).
- Reglas **hardcodeadas**, no configurables por el usuario (decisión consciente:
  CRM monopropósito, no necesita motor de configuración).
- El motor **solo avanza** (`Contacto → Lead → Cliente`). Nunca retrocede ni
  pasa a `Descartado` por sí solo: descartar y reactivar son siempre manuales.
- Determinista: un tipo de evento mapea a lo sumo a un estado destino. Eventos
  sin estado claro son no-op.
- Idempotente / tolerante a desorden: si el evento implica un estado al que el
  contacto ya llegó o uno anterior, no-op (nunca rebobina). Un evento viejo
  cargado tarde no retrocede el estado.

#### Mapa de transiciones (confirmado)

| Tipo de evento | Efecto en el estado |
|---|---|
| Respuesta recibida | `Contacto → Lead` (no-op si ya es Lead o posterior) |
| Reunión / Llamada | `Contacto → Lead` (no-op si ya es Lead o posterior) |
| Propuesta enviada | `Contacto → Lead` (no-op si ya es Lead o posterior) |
| Propuesta cerrada (ganada) | `→ Cliente` |
| Propuesta rechazada | No-op (no descarta solo; lo decide el humano) |
| Primer contacto / Mensaje enviado / Seguimiento pendiente / Nota | No-op |

### 8.2 Override manual — "manual gana (lock)"

- Un usuario puede fijar el estado a mano en cualquier momento.
- Hacerlo **marca el contacto como "estado fijado manualmente"**: el motor
  **suspende las auto-transiciones para ese contacto** hasta una nueva acción
  manual.
- Razón: el humano overridea porque sabe algo que la regla no; un evento
  atrasado o mal cargado no debe pisar silenciosamente esa corrección.

### 8.3 Mitad de salida — observabilidad (auditoría)

- **Todo** cambio de estado —lo cause el motor o un cambio manual— genera un
  registro de auditoría en el historial: `estado anterior → estado nuevo`,
  fecha, causa (evento X / cambio manual por usuario Y).
- Es **append-only**. No se filtra: se registran TODOS los cambios, no una
  selección (registrar solo algunos haría mentir al timeline).
- Ese registro de auditoría **no vuelve a entrar al motor** (no evalúa reglas):
  es solo observabilidad.

## 9. Requisitos funcionales (MVP)

1. Crear, ver, editar y eliminar contactos.
2. Asignar y editar los campos de clasificación predefinidos.
3. Registrar eventos en la línea de tiempo de un contacto (tipo + detalle),
   con autor.
4. Al registrar un evento, aplicar automáticamente la transición de estado que
   corresponda (motor de sección 8), salvo contacto con override manual activo.
5. Cambiar manualmente el estado de un contacto (activa el lock de override).
6. Registrar en auditoría todo cambio de estado (automático o manual).
7. Ver el historial de eventos y los cambios de estado de un contacto,
   ordenado por fecha.
8. Listar contactos con filtros por estado, canal y nivel de interés.
9. Buscar contactos por nombre o identificador (handle/teléfono).
10. Login por usuario (cuentas individuales, todas con el mismo rol).
11. Alta de usuarios: sin auto-registro abierto; cualquier usuario autenticado
    puede dar de alta a otro.
12. Atribución: cada contacto registra qué usuario lo creó; cada evento
    registra su autor.

## 10. Requisitos no funcionales

- Equipo chico sobre un workspace compartido; volumen y concurrencia bajos.
  **Concurrencia:** ante edición concurrente del mismo registro, "última
  escritura gana" (sin bloqueo ni merge). No se optimiza para escala masiva.
- Registrar un evento y la transición de estado resultante deben ser
  **atómicos** (misma transacción): nunca uno sin el otro.
- Persistencia, contrato de API y arquitectura: según los ADRs de cada paquete
  (`app/api`, `app/ui`). Este PRD no toma decisiones técnicas.
- Datos personales de contactos: tratarlos como sensibles (acceso solo tras
  login). Sin requisitos legales adicionales en MVP por ser uso interno.

## 11. Métricas de éxito

- Todos los contactos viven en el sistema (no en notas sueltas/chats).
- Para cualquier contacto se puede responder en segundos: en qué estado está,
  por qué llegó ahí y qué pasó la última vez.
- El estado mostrado nunca contradice el historial.

## 12. Registro de decisiones (cerradas en v0.2)

| # | Decisión | Resolución |
|---|---|---|
| 1 | Segmento | Eliminado del MVP. |
| 2 | Estados / reactivación | `Contacto`, `Lead`, `Cliente`, `Descartado`. Sin "Perdido". Reactivación manual. |
| 3 | Detalle de evento | Solo texto. Sin adjuntos en MVP. |
| 4 | Tipos de evento | Lista fija de 9 (sección 7). |
| 5 | Motor de estado | Automático en MVP, reglas hardcodeadas, unidireccional `Event→estado`, sin config dinámica. |
| 6 | Gestión de usuarios | Sin auto-registro; cualquier usuario autenticado da de alta a otro. |
| 7 | Atribución | Sí: `contact.created_by` y `event.author` → `user`. |
| 8 | Override (caso Ana) | "Manual gana (lock)". |
| 9 | Concurrencia | "Última escritura gana". |
| 10 | Observabilidad | Auditoría append-only de todo cambio de estado; no realimenta el motor. |

### Estado: cerrado

- Sin puntos abiertos. El mapa de transiciones (sección 8.1) fue confirmado.
- Modelado de datos implementado en `app/api` (schema Drizzle + aggregate
  `Contact` con motor y lock + repos + `User` + migración).

> Follow-up de documentación pendiente (no bloqueante): anexar a `auth.md` de
> `app/api` la resolución "sin roles en el producto", y registrar el set de
> convenciones de datos (UUIDv7, timestamps, soft-delete, pgEnum, naming) como
> EDR del paquete.

---

*v0.3 — PRD cerrado. Mapa confirmado. Modelado implementado.*
