---
name: architecture-bootstrap
description: Entrevista interactiva por fases para capturar decisiones arquitectónicas al iniciar un proyecto y materializarlas como ADRs (Architecture Decision Records) en .claude/adr/. Usá esta skill SIEMPRE que el usuario inicie un proyecto nuevo, clone un repo vacío, mencione "arrancar un proyecto / empezar un proyecto / setup inicial", pida ayuda con la arquitectura inicial, hable de "definir capas, estructura, convenciones", quiera revisar o actualizar decisiones arquitectónicas existentes, o cuando detectes un repo sin .claude/adr/ ni CLAUDE.md y el usuario esté por escribir código que toca estructura. También dispará si el usuario menciona "ADR", "decisión arquitectónica", "convenciones del proyecto", "manejo de errores", "capas", "acoplamiento", "estructura de carpetas".
---

# Project Architecture Bootstrap

Entrevista al usuario para capturar las decisiones arquitectónicas y de convenciones del proyecto, y las materializa como ADRs estructurados que Claude consultará en futuras sesiones via `.claude/adr/INDEX.md`.

El objetivo es que las decisiones queden **registradas y verificables**, no implícitas en la cabeza del autor. Eso le permite a Claude (y a cualquier nuevo dev) trabajar respetando las convenciones sin volver a preguntarlas.

---

## Arquitectura de esta skill

La skill está partida en **motor** y **datos**:

- **`SKILL.md` (este archivo) = el motor.** Define CÓMO se trata cualquier fase: el flujo, las reglas de UX, cómo se materializa un ADR, el modo update. Es estable; casi no cambia.
- **`concerns/` = el catálogo de fases (los datos).** Un archivo por fase (`concerns/<slug>.md`) con qué decide, qué preguntar y qué materializar. `concerns/INDEX.md` es la matriz que dice qué fase aplica a cada tipo de proyecto. Esto crece con el tiempo (ver "Ratchet").
- **Salida = ADRs en `.claude/adr/` del proyecto objetivo.** No confundir con `concerns/`, que es el catálogo de la skill.

El motor lee `concerns/INDEX.md` **una sola vez** para armar la lista de fases relevantes, y recién después lee el archivo individual de cada fase que se va a tratar. Así no carga al contexto fases que no aplican.

---

## Cuándo correr esta skill

- Proyecto nuevo (greenfield) sin `.claude/adr/` ni `CLAUDE.md`
- Repo existente que el usuario quiere "ordenar"
- El usuario pide explícitamente revisar/actualizar decisiones de arquitectura
- Detectás que vas a tocar estructura/capas/auth/errores y no hay convenciones documentadas

Si `.claude/adr/INDEX.md` ya existe con contenido: **NO rehagas todo**. Andá al modo `update` (final del documento).

---

## Reglas del motor (aplican a TODAS las fases)

Estas reglas son la diferencia entre una skill que la gente usa y una que abandona en el tercer turno.

**Una pregunta por turno.** Nunca dumpees una lista de 8 preguntas. Hacé una, esperá la respuesta, leéla, recién ahí formulá la siguiente.

**Opciones concretas con default sugerido.** Mal: "¿cómo manejás errores?". Bien: "¿Excepciones (default para Python/Java/Node), Result types (default para Rust/Go), o mix pragmático? Para tu stack te recomiendo X porque Y." Los defaults y las opciones de cada fase están en su archivo `concerns/<slug>.md`.

**Siempre incluí "no sé, recomendame".** Mucha gente no tiene opinión formada todavía. Cuando elijan esa opción, proponé con justificación de 2 líneas y pedí confirmación.

**Una línea de "por qué importa" antes de cada pregunta.** Usá el "Qué decide" del archivo de la fase. Sin sermones.

**Adaptate al contexto.** Si la descripción del proyecto o el pre-flight ya respondieron algo, no lo vuelvas a preguntar. Saltá lo que no aplique, pero **nunca omitas en silencio** (ver siguiente regla).

**Nunca omitas en silencio.** Si una fase se salta — por elección del usuario, por atajo, o porque "no aplica" — generá igualmente el ADR con `Status` apropiado (`Not Applicable`, `Pending`, `Deferred`) y una **razón breve de 1-2 líneas**. Una omisión sin justificación es una decisión perdida. Ver "Cómo manejar fases omitidas".

**Permití aplazar explícitamente.** Cualquier fase puede quedar `Pending` con la razón ("lo definimos cuando llegue el feature de pagos"). Mejor un ADR honesto con "pendiente + por qué" que una decisión inventada.

**Registrá tecnologías a medida que aparecen.** Cada vez que el usuario menciona o confirma una tecnología concreta, creá su mini-ADR en `.claude/adr/tech/<nombre>.md` en el momento. No esperes a la materialización final. Ver "Catálogo de tecnologías".

---

## Pre-flight (siempre primero)

Antes de la primera pregunta, inspeccioná el repo objetivo:

```bash
ls -la
test -f CLAUDE.md && echo "--- CLAUDE.md existe ---" && cat CLAUDE.md
test -d .claude/adr && echo "--- ADRs existentes ---" && ls .claude/adr/
test -d .claude/adr/tech && echo "--- Tech ya registrada ---" && ls .claude/adr/tech/
test -f package.json && echo "--- package.json ---" && head -50 package.json
test -f pyproject.toml && echo "--- pyproject.toml ---" && head -50 pyproject.toml
test -f go.mod && echo "--- go.mod ---" && cat go.mod
test -f Cargo.toml && echo "--- Cargo.toml ---" && head -30 Cargo.toml
test -f composer.json && echo "--- composer.json ---" && head -30 composer.json
test -f Gemfile && echo "--- Gemfile ---" && cat Gemfile
```

Con eso ya sabés:
- Si hay decisiones previas (`.claude/adr/INDEX.md` existe → modo update)
- Stack y framework principal (para inferir tipo y defaults)
- Si el repo es greenfield o tiene código existente

---

## El flujo

### 1. Descripción del proyecto (entrada conversacional)

Una sola pregunta abierta, sin interrogatorio:

> Contame a grandes rasgos de qué trata el proyecto: qué hace, qué tan importante es la seguridad, qué convenciones te importan, y qué stack pensás usar. No hace falta detalle, solo una idea para arrancar.

### 2. Inferencia + recomendación

De la descripción + el pre-flight, inferí (sin re-preguntar lo que ya quedó claro):

- **Tipo de proyecto** → mapealo a un token de `concerns/INDEX.md` (`api-rest`, `api-graphql`, `cli`, `libreria`, `web-spa`, `web-ssr`, `microservicio`, `monolito-modular`, `script`). Si es ambiguo entre dos, hacé UNA pregunta puntual.
- **Stack** → del pre-flight o de lo que mencionó. Si no se detectó y es crítico, preguntá.
- **"Knobs" de intensidad** del lenguaje de la descripción:
  - Menciona seguridad alta / datos sensibles / usuarios externos → subí las fases de seguridad (`authorization`, `input-validation`, `rate-limiting`, `cors`, `secrets-management`, `dependency-scanning`) a Requerido.
  - Menciona MVP / prototipo / "rápido" → mantené lo esencial, ofrecé el resto como opcional.
  - Menciona convenciones estrictas / equipo grande → incluí `folder-structure`, `ci-quality-gates`, `arch-enforcement`.

Leé `concerns/INDEX.md` UNA vez. Armá el set: **Requerido(token) + Recomendado(token)**, ajustado por los knobs. Presentalo:

> Por lo que contás, esto parece un **[tipo]**. Te recomiendo estas fases:
> - **[grupo]:** `fase-a` (por qué), `fase-b` (por qué)…
> - …
>
> Quedan afuera por ahora (no parecen aplicar): `fase-x`, `fase-y`.
>
> ¿Confirmás el tipo y el stack que detecté? [solo si quedó alguna duda]

### 3. Ajuste del set

> ¿Querés sacar alguna de estas, o agregar otras del catálogo?

Mostrá qué más hay disponible para sumar (las fases del catálogo no incluidas). Permití también **fase custom** (ver "Fase custom"). Lo que el usuario saque del set recomendado se materializa igual como ADR `Not Applicable`/`Pending` con razón — nunca hueco silencioso.

### 4. Recorrido de fases

Por cada fase del set final, seguí el procedimiento de "Cómo tratar una fase". Intercalá el registro de tecnologías cuando aparezcan.

### 5. Materialización

Cuando se recorrieron todas, materializá (ver "Materialización").

### 6. Validación (recomendada)

Al cerrar, ofrecé correr el validador `architecture-validate` en **contexto fresco** (como sub-agente), pasándole el tipo de proyecto y la lista de fases relevantes. Chequea coherencia entre ADRs, completitud y verificabilidad, y reporta con severidad. No modifica nada — los hallazgos los resuelve el usuario vía modo update. Es opcional pero recomendado: ojos frescos atrapan contradicciones que el flujo de la entrevista no ve.

---

## Cómo tratar una fase

Este es el procedimiento genérico del motor. Vale para cualquier fase, sea del catálogo o custom:

1. **Leé `concerns/<slug>.md`** (solo cuando vas a tratar esa fase).
2. Mostrá su **"Qué decide"** como la línea de "por qué importa".
3. Hacé sus **preguntas, una por turno**, en el orden del archivo. Para cada una: ofrecé las opciones con el default marcado e incluí "no sé, recomendame".
4. Si el archivo tiene **"Notas de lógica (para el motor)"**, aplicalas: defaults según stack, preguntas condicionales, propuestas según respuestas de fases previas.
5. **Confirmá** la decisión antes de seguir.
6. Si el archivo tiene **"Tech a registrar"** y se eligió una tecnología concreta, creá su mini-ADR en `tech/` en el momento (ver "Catálogo de tecnologías").
7. **Materializá el ADR** según la sección "Qué materializar" del archivo.

Si la fase estaba recomendada pero el usuario la sacó, o no aplica: no la trates, pero generá igual su ADR con `Status: Not Applicable`/`Pending` + razón.

---

## Cómo manejar fases omitidas

Cuando el usuario saca una fase, dice "no aplica" o "lo decidimos después": **NO te saltes el archivo, solo cambiá el status y registrá el motivo.**

Hacé una pregunta corta para clasificar el motivo:

1. **No aplica al tipo de proyecto** → `Not Applicable`. Ej: "Es un script CLI sin red, no necesita auth."
2. **Lo decidimos después** → `Pending` (con trigger esperado opcional). Ej: "Definimos auth cuando llegue el milestone de usuarios públicos."
3. **No me interesa documentarlo / ad-hoc** → `Not Applicable` con motivo honesto.
4. **Otra razón** → el status que aplique, motivo libre.

### Status posibles

Conjunto cerrado, así el INDEX y las revisiones futuras son consistentes:

- **`Accepted`** — Decisión tomada y vigente.
- **`Pending`** — Sabemos que hay que decidirlo, todavía no es el momento. Incluye trigger ("cuando…") si se conoce.
- **`Not Applicable`** — Decisión consciente de que este tema no aplica. Lleva razón obligatoria.
- **`Deferred`** — Postergado deliberadamente con fecha o condición de revisión.
- **`Superseded`** — Reemplazado por otro ADR. Lleva referencia al que lo sustituye.

---

## Fase custom

Si el usuario quiere un tema que no está en el catálogo:

1. Tratalo con el procedimiento genérico, haciéndole 2-3 preguntas para extraer qué decide, opciones y qué materializar.
2. Antes de guardarlo, preguntá: **"¿La guardo en el catálogo para reusar en futuros proyectos, o solo para este proyecto?"**
   - **Reusable** → creá `concerns/<slug>.md` con el formato estándar (ver `concerns/error-handling.md` como referencia) y sumá la fila a `concerns/INDEX.md`. Esto es el ratchet: un tema olvidado queda cubierto para siempre.
   - **Solo este proyecto** → no toques el catálogo; generá únicamente el ADR de salida.
3. En ambos casos, materializá el ADR en `.claude/adr/`.

---

## Catálogo de tecnologías (transversal a todas las fases)

Registro paralelo que se construye intercalado con la conversación. Cada vez que el usuario menciona o confirma una tecnología concreta, creás su mini-ADR.

### Cuándo crear un mini-ADR de tecnología

- El usuario nombra una lib/framework/herramienta ("usemos Postgres", "para tests pytest").
- El usuario elige una opción que implica una tecnología ("ORM" → preguntar cuál → registrar).
- Vos recomendás algo y lo acepta.
- Lo detectaste en pre-flight y el usuario confirma seguir usándola.

**No registres** versiones internas del lenguaje, dependencias transitivas, ni herramientas de build estándar (npm, pip) salvo que el usuario las haya elegido explícitamente sobre otra (ej: pnpm sobre npm sí).

### Flujo al detectar una tecnología

Tres preguntas rápidas (pueden ir en un turno):

1. **Versión.** Si el manifest la tiene, mostrala como default.
2. **Por qué (1-2 líneas).** Si no tiene una razón clara, sugerí una y pedí confirmación.
3. **Alternativas descartadas (1 línea).** 1-3 que se consideraron, o "ninguna evaluada" (información honesta).

Escribí el archivo y seguí con la fase. No detengas el flujo principal por esto.

### Estructura

```
.claude/adr/tech/
├── INDEX.md                  # tabla por categoría
├── python.md
├── fastapi.md
├── postgresql.md
└── ...
```

Naming: `<nombre-en-kebab-case>.md`, sin prefijos numéricos.

### Template del mini-ADR de tecnología

```markdown
# <Nombre de la tecnología>

- **Categoría:** <Lenguaje | Framework web | DB | ORM | Test | Logging | DI | Config | Auth | Migraciones | Otro>
- **Versión:** <ej: 3.12 | ^0.115.0 | latest | sin pinear>
- **Status:** Accepted
- **Decidido en fase:** <slug de la fase>
- **Fecha:** <YYYY-MM-DD>

## Por qué la elegimos

<1-2 líneas. Concreto, no marketing.>

## Alternativas descartadas

- **<alternativa A>:** <1 línea con el motivo.>
- (o "Ninguna evaluada formalmente" si fue elección por defecto)

## Notas

<opcional. Restricciones, gotchas, configuración no obvia>
```

### Template del INDEX de tech (`.claude/adr/tech/INDEX.md`)

```markdown
# Catálogo de tecnologías

Registro vivo de las tecnologías concretas elegidas. Cada entrada apunta a un mini-ADR con el "por qué" y alternativas descartadas.

**Para Claude:** consultá esta tabla antes de sugerir agregar una nueva dependencia. Si lo que vas a agregar pisa con algo ya elegido, **no lo agregues sin preguntar**.

## Por categoría

### Lenguaje y runtime
| Tech | Versión | Por qué (resumen) |
|---|---|---|

### Framework principal
| Tech | Versión | Por qué |
|---|---|---|

### Base de datos
| Tech | Versión | Por qué |
|---|---|---|

### ORM / Acceso a datos
| Tech | Versión | Por qué |
|---|---|---|

### Testing
| Tech | Versión | Por qué |
|---|---|---|

### Logging
| Tech | Versión | Por qué |
|---|---|---|

### Configuración / Secretos
| Tech | Versión | Por qué |
|---|---|---|

### Auth
| Tech | Versión | Por qué |
|---|---|---|

### Inyección de dependencias
| Tech | Versión | Por qué |
|---|---|---|

### Otros
| Tech | Versión | Por qué |
|---|---|---|

## Mantenimiento

- **Agregar tech:** crear `<nombre>.md`, sumar fila en la categoría.
- **Reemplazar tech:** marcar el viejo `Superseded`, crear el nuevo, sacar del INDEX el viejo (o moverlo a "Históricas").
- **Actualizar versión:** editar el archivo, anotar en Notas si hay breaking changes.
```

Las categorías sin filas se dejan vacías para que se vean los huecos.

---

## Materialización

### Paso 1: Resumir y confirmar

Antes de escribir nada, mostrá un resumen completo de todas las decisiones, agrupadas por fase, con su status. Pedí confirmación final. Permití editar cualquier respuesta.

### Paso 2: Estructura de archivos a generar

Los ADRs de salida son **slug-based** (sin prefijos numéricos), igual que `tech/`. El orden y la agrupación salen del INDEX.

```
<root>/
├── CLAUDE.md                         # mínimo, apunta al INDEX
└── .claude/
    └── adr/
        ├── INDEX.md                  # router que dice cuándo consultar cada ADR
        ├── <slug>.md                 # un ADR por fase tratada (ej: error-handling.md)
        ├── ...
        └── tech/
            ├── INDEX.md
            └── <una tech>.md
```

**Todas** las fases del set final se materializan: las tratadas con `Status: Accepted` y contenido completo; las sacadas/omitidas con `Status: Not Applicable`/`Pending`/`Deferred` y razón. El nombre de archivo de cada ADR es el `adr-output` del `concerns/<slug>.md` correspondiente (por default, el slug).

### Paso 3: Templates

**`CLAUDE.md` (raíz, mínimo):**

```markdown
# Project Conventions for Claude

Las decisiones arquitectónicas y de convenciones de este proyecto están en `.claude/adr/`.

**Antes de escribir código que toque arquitectura, capas, errores, auth, datos o convenciones, leé `.claude/adr/INDEX.md`** para saber qué ADR consultar.

**Antes de instalar/sugerir cualquier dependencia nueva (lib, framework, herramienta, DB), leé `.claude/adr/tech/INDEX.md`** para ver qué tecnologías ya están elegidas. Si tu sugerencia pisa con algo ya registrado, no la introduzcas sin preguntar.

Si una decisión no está documentada o algo no queda claro, **preguntá al usuario antes de inventar una convención**. Las decisiones se registran como ADR, no se improvisan.

Para crear, actualizar o revisar decisiones arquitectónicas (incluyendo agregar/cambiar tecnologías del catálogo), usá la skill `architecture-bootstrap`.
```

**`.claude/adr/INDEX.md`:**

```markdown
# Architecture Decision Records — Index

Este índice te dice qué ADR consultar según lo que estés por hacer. Leé solo los relevantes a la tarea actual.

## Cómo usar este índice

1. Identificá qué tipo de tarea estás por hacer.
2. Buscá la fila correspondiente.
3. Leé los ADRs listados antes de escribir código.
4. Si hay contradicción entre tu plan y un ADR: pará y preguntale al usuario.

## Mapa de ADRs

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [<slug>.md](<slug>.md) | <status> | <tema> | <gatillo> |
| ... | | | |
| [tech/INDEX.md](tech/INDEX.md) | — | Catálogo de tecnologías | Vayas a agregar/cambiar una dependencia. **Consultá siempre antes de instalar algo nuevo.** |

**Leyenda de status:** `Accepted` = vigente · `Pending` = decidir más adelante · `Not Applicable` = decidido que no aplica · `Deferred` = postergado con condición · `Superseded` = reemplazado por otro ADR.

> Para ADRs con status distinto de `Accepted`, leé la sección "Razón de omisión / aplazamiento" del archivo. **No asumas que la falta de decisión es un olvido** — está documentada.

## Estado y mantenimiento

- Última actualización: <YYYY-MM-DD>
- **Actualizar una decisión (cambio menor):** editá el ADR. El historial lo lleva git.
- **Cambiar una decisión (cambio de fondo):** creá un ADR nuevo, marcá el viejo `Superseded` con link al nuevo. No edites la decisión vieja en el lugar.
- **Decisión nueva:** creá el ADR y sumá fila a este INDEX.
```

(Solo incluí en la tabla las filas de las fases que se materializaron.)

**Template para cada ADR individual:**

```markdown
# ADR — <título>

- **Status:** <Accepted | Pending | Not Applicable | Deferred | Superseded>
- **Fecha de creación:** <YYYY-MM-DD>
- **Última actualización:** <YYYY-MM-DD>
- **Decisores:** <usuario>
- **Fase:** <slug>

## Contexto

<por qué hace falta esta decisión, qué condicionantes hay del proyecto/stack/equipo/alcance>

## Decisión

<lo decidido, en imperativo. Ej: "Usamos JWT con refresh tokens y rotación; access token de 15min, refresh de 7d.">

<!-- Si Status NO es Accepted, REEMPLAZAR "Decisión" por:

## Razón de omisión / aplazamiento

**Status:** <Pending | Not Applicable | Deferred>

<1-2 líneas con el motivo, honesto y concreto.
- Pending: indicá el trigger esperado ("cuando llegue X").
- Not Applicable: por qué no aplica al proyecto.
- Deferred: fecha o condición de revisión.>
-->

<!-- Si Status es Superseded, agregar:
## Reemplazado por
[<slug-del-nuevo>.md](<slug-del-nuevo>.md) — <1 línea de por qué cambió la decisión>
-->

## Alternativas consideradas

<si Accepted, listá alternativas evaluadas con por qué no se eligieron. Si no se decidió, omitir.>

## Consecuencias

<si Accepted, positivas y trade-offs. Si no se decidió, omitir.>

## Reglas concretas (si aplica)

<reglas verificables — paths, globs, nombres, ejemplos mínimos. Solo si Accepted.>
```

> **No hay sección `Historial`.** El historial de ediciones lo lleva git; la evolución de decisiones se ve en la cadena de `Superseded`.

### Paso 4: Escribir y reportar

1. `mkdir -p .claude/adr/tech`
2. Escribir `CLAUDE.md` (si no existe; si existe, **NO sobrescribir** — preguntar al usuario qué hacer)
3. Escribir `.claude/adr/INDEX.md` con la columna Status reflejando el estado real
4. Escribir **todos** los ADRs de las fases del set (Accepted con contenido completo; omitidos con su status + razón)
5. Escribir `tech/INDEX.md` (los archivos individuales de tech ya se fueron creando intercalados)
6. Reportar al usuario:
   - Lista de archivos creados (path completo)
   - Resumen de 1 línea por ADR, con su status entre corchetes (`[Accepted]`, `[Pending]`, `[N/A]`)
   - Tecnologías registradas en `tech/`
   - **Lista separada de ADRs `Pending`/`Deferred` con su trigger**, así sabe qué quedó por decidir
   - Sugerencia de commitear estos archivos al repo
7. Ofrecer correr el validador `architecture-validate` en contexto fresco (ver flujo, paso 6) antes de dar por cerrado el bootstrap.

---

## Modo update (cuando `.claude/adr/INDEX.md` ya existe)

1. **Leé el INDEX y los ADRs** existentes.
2. **Mostrá un resumen** agrupado por status: `Accepted`, `Pending` (con trigger), `Not Applicable` (con razón), `Deferred`.
3. **Preguntá si algún `Pending` o `Deferred` ya está listo para resolverse.** Es lo más importante del modo update — sin esto, los "lo decidimos después" se pierden.
4. **Ratchet — barré el catálogo:** leé `concerns/INDEX.md`, listá las fases relevantes al tipo de proyecto que **no tengan ADR todavía** (típicamente fases nuevas agregadas al catálogo desde la última corrida) y ofrecé tratarlas ahora. Esta es la forma de que los temas que se agregan al catálogo lleguen a proyectos viejos.
5. **Después preguntá qué más quiere hacer:**
   - **Resolver un Pending/Deferred** → recorrer las preguntas de esa fase, cambiar Status a `Accepted`, llenar contenido.
   - **Actualizar una decisión (cambio menor)** → editar el ADR. Git lleva el historial.
   - **Cambiar una decisión (cambio de fondo)** → crear ADR nuevo, marcar el viejo `Superseded` con link al nuevo. No editar la decisión vieja en el lugar.
   - **Agregar una decisión nueva** no cubierta → crear ADR + fila en el INDEX.
   - **Cambiar un `Not Applicable` a `Pending`/`Accepted`** → el contexto del proyecto cambió (ej: el script chico creció a app multiusuario y ahora sí hay auth). Actualizar Status, llenar contenido.
   - **Agregar/cambiar/quitar una tecnología** → editar `tech/INDEX.md` y el archivo en `tech/<nombre>.md`. Si reemplazás, el viejo queda `Superseded` apuntando al nuevo.
   - **Rehacer todo desde cero** → confirmación doble. Antes de sobrescribir, mover el directorio a `.claude/adr.old.<timestamp>/`.
6. Para actualizar/agregar, recorré solo las fases relevantes — no rehagas todo el cuestionario.

---

## Ratchet: agregar una fase al catálogo

El valor de largo plazo de la skill es que **nunca se vuelva a olvidar un tema**. Cuando aparece un concern que no estaba:

1. Creá `concerns/<slug>.md` con el formato estándar (mirá `concerns/error-handling.md` para una fase `deep` y `concerns/caching.md` para una `light`).
2. Sumá la fila a `concerns/INDEX.md` en su categoría, con la aplicabilidad por tipo de proyecto (Requerido/Recomendado).

Desde ese momento, todo bootstrap futuro lo considera, y el modo update lo ofrece a proyectos viejos (paso 4 de update). El catálogo se sembró de taxonomías externas (ISO/IEC 25010, 12-factor, arc42, OWASP ASVS, production-readiness) para nacer casi completo y solo crecer.

---

## Anti-patterns que esta skill evita

- ❌ Tirar todas las preguntas en un solo turno → la gente abandona.
- ❌ Forzar Clean Architecture en un script de 200 líneas → adaptar el set de fases al tipo de proyecto.
- ❌ Saltar una fase sin documentar el motivo → siempre crear el ADR con `Not Applicable`/`Pending`/`Deferred` + razón.
- ❌ Confundir "no decidido aún" (`Pending`) con "decidido que no aplica" (`Not Applicable`) → son status distintos.
- ❌ Editar una decisión de fondo en el lugar → para cambios de decisión, supersede (ADR nuevo + viejo `Superseded`). Cambios menores sí se editan; git lleva el historial.
- ❌ Mantener una tabla `Historial` manual → es redundante con git y se pudre.
- ❌ Inventar reglas no discutidas con el usuario en la materialización → todo lo que va al ADR fue confirmado.
- ❌ Reglas vagas tipo "tratá de no acoplar capas" → siempre verificable: paths, globs, ejemplos.
- ❌ Sobrescribir un `CLAUDE.md` existente sin permiso → preguntar y ofrecer merge.
- ❌ Asumir el stack en lugar de detectarlo en pre-flight → leer manifests primero.
- ❌ Leer todo el catálogo `concerns/` de una → leer `INDEX.md` para seleccionar, y cada `concerns/<slug>.md` solo cuando se trata esa fase.
- ❌ Dejar el catálogo `tech/` vacío hasta el final → registrar intercalado, mientras la justificación está fresca.
- ❌ Agregar una dependencia en sesiones futuras sin consultar `tech/INDEX.md` → revisar primero si ya hay algo elegido.
- ❌ En modo update, no preguntar por los `Pending`/`Deferred` ni barrer el catálogo por fases nuevas → es como se pierden las decisiones aplazadas y las fases agregadas.

---

## Recordatorio final

El valor de esta skill no está en las preguntas — está en que las decisiones queden **escritas, accionables y mantenidas**. Si las preguntas son geniales pero los ADRs salen vagos, fallamos. Si los ADRs son específicos y verificables, Claude (y cualquier dev) puede trabajar respetando las convenciones sin volver a preguntar.

Escribí los ADRs con la misma claridad con la que le explicarías la convención a un dev nuevo el primer día.
