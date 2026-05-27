---
name: arch-enforcement
group: Operación / entrega
depth: light
adr-output: arch-enforcement
source: práctica de architecture-as-code / CI quality gates
---

# Fase: Enforcement de arquitectura

## Qué decide

Cómo convertir las reglas de dependencia definidas en `layers-and-dependencies` en configuración ejecutable de un linter que corra en CI y falle el build si se viola una regla.

## Preguntas

### 1. Herramienta de enforcement según stack

> Sin enforcement automatizado, las reglas de capas son recomendaciones que se degradan con el tiempo. El linter las vuelve verificables en cada PR.

- **`import-linter`** — *default para Python; reglas en `setup.cfg` o `.importlinter`.*
- **`dependency-cruiser`** — *default para JS / TS; config en `.dependency-cruiser.js`.*
- **`ArchUnit`** — *default para Java / Kotlin; tests en JUnit.*
- **`deptrac`** — alternativa para PHP.
- Sin enforcement por ahora — solo convención documentada.
- No sé, recomendame.

### 2. Integración en CI

> Que el linter exista en local pero no bloquee el merge no da garantías reales.

- **Sí, bloquea el merge en CI** — *default recomendado.*
- Solo corre localmente (pre-commit hook).
- No por ahora.

## Notas de lógica (para el motor)

- Esta fase requiere que `layers-and-dependencies` esté en status `Accepted` con reglas definidas. Si no hay capas definidas o están `Pending`, marcar esta fase como `Pending` con motivo "sin reglas de dependencia para enforcer".
- La config del linter se genera a partir de las reglas (paths/globs) acordadas en `layers-and-dependencies`. No hay que volver a pedirlas — leerlas del ADR anterior.
- Usá la plantilla de "Plantillas de config por herramienta" que corresponda a la herramienta elegida; adaptá los nombres de capa y los paths a las reglas reales del ADR `layers-and-dependencies`.
- Después de generar la config, si el repo ya tiene código, ofrecé correr el linter una vez para confirmar que la config es válida y que el código actual respeta las reglas. Si el repo está vacío (greenfield), dejá la config lista para cuando haya código.

## Tech a registrar

La herramienta elegida (ej: `import-linter.md`, `dependency-cruiser.md`, `archunit.md`).

## Plantillas de config por herramienta

El motor traduce las reglas de `layers-and-dependencies` (globs tipo "X solo importa de Y", "prohibido X → Z") a la sintaxis de la herramienta elegida. Las plantillas usan un ejemplo Clean (`domain` ← `application` ← `presentation`, con `infrastructure` que implementa interfaces); adaptá los nombres a las capas reales del proyecto.

### import-linter (Python)

Config en `.importlinter` (o `setup.cfg`): un contrato `layers` para el orden + contratos `forbidden` para prohibiciones puntuales.

```ini
[importlinter]
root_package = myapp

[importlinter:contract:capas]
name = Orden de capas
type = layers
layers =
    myapp.presentation
    myapp.application
    myapp.domain

[importlinter:contract:domain-puro]
name = Domain no depende de frameworks ni capas externas
type = forbidden
source_modules =
    myapp.domain
forbidden_modules =
    myapp.infrastructure
    myapp.presentation
```

Correr: `lint-imports` (exit code ≠ 0 si se viola un contrato).

### dependency-cruiser (JS/TS)

Config en `.dependency-cruiser.js`, reglas `forbidden`:

```js
module.exports = {
  forbidden: [
    {
      name: 'domain-solo-domain',
      severity: 'error',
      from: { path: '^src/domain' },
      to: { pathNot: '^src/domain' },
    },
    {
      name: 'no-presentation-a-infra',
      severity: 'error',
      from: { path: '^src/presentation' },
      to: { path: '^src/infrastructure' },
    },
  ],
};
```

Correr: `depcruise src --config .dependency-cruiser.js`.

### ArchUnit (Java/Kotlin)

Test JUnit dentro del suite (falla como cualquier test):

```java
@AnalyzeClasses(packages = "com.myapp")
class ArchitectureTest {
  @ArchTest
  static final ArchRule capas = layeredArchitecture()
      .consideringAllDependencies()
      .layer("Domain").definedBy("..domain..")
      .layer("Application").definedBy("..application..")
      .layer("Presentation").definedBy("..presentation..")
      .whereLayer("Presentation").mayNotBeAccessedByAnyLayer()
      .whereLayer("Application").mayOnlyBeAccessedByLayers("Presentation")
      .whereLayer("Domain").mayOnlyBeAccessedByLayers("Application", "Presentation");
}
```

Correr: con el suite (`mvn test` / `gradle test`).

### deptrac (PHP)

Config en `deptrac.yaml`:

```yaml
deptrac:
  paths: [./src]
  layers:
    - name: Domain
      collectors: [{ type: directory, value: src/Domain/.* }]
    - name: Application
      collectors: [{ type: directory, value: src/Application/.* }]
    - name: Presentation
      collectors: [{ type: directory, value: src/Presentation/.* }]
  ruleset:
    Domain: []
    Application: [Domain]
    Presentation: [Application, Domain]
```

Correr: `vendor/bin/deptrac`.

## Qué materializar

ADR `arch-enforcement` con: herramienta elegida y si corre en CI bloqueando el merge. Además:

- El **archivo de config del linter** generado con la plantilla que corresponda, traduciendo las reglas reales del ADR `layers-and-dependencies`, listo para commitear.
- Si se eligió CI: el **comando del linter** (`lint-imports` / `depcruise …` / `mvn test` / `vendor/bin/deptrac`) agregado como step que falle el build. La config de CI concreta (GitHub Actions, GitLab, etc.) depende del proyecto; dejá anotado al menos el comando y la intención de que bloquee el merge.
