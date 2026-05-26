module.exports = {
  forbidden: [
    {
      name: 'adr02-1-domain-purity',
      severity: 'error',
      comment: 'ADR 02 #1: el conjunto de dominio puro del slice solo importa de su propio domain + src/shared/errors. El port (<entity>.repository.ts) está excluido — tiene regla propia (1b) más permisiva.',
      from: {
        path: '^src/modules/([^/]+)/domain/',
        pathNot: '\\.repository\\.ts$',
      },
      to: { pathNot: ['^src/modules/$1/domain/', '^src/shared/errors/'] },
    },
    {
      name: 'adr02-1b-port-contract',
      severity: 'error',
      comment: 'El port en domain (<entity>.repository.ts) puede importar su propio domain + shared/errors + shared/types (Page<T>, etc.). Nunca http, infrastructure, ni otro slice.',
      from: { path: '^src/modules/([^/]+)/domain/[^/]+\\.repository\\.ts$' },
      to: { pathNot: ['^src/modules/$1/domain/', '^src/shared/errors/', '^src/shared/types/'] },
    },
    {
      name: 'adr02-2-usecases-no-framework',
      severity: 'error',
      comment: 'ADR 02 #2: los use-cases (application/use-cases/**) no conocen Hono, ni infrastructure (adapter concreto), ni http (presentation).',
      from: { path: '^src/modules/[^/]+/application/use-cases/' },
      to: {
        path: [
          '^src/modules/[^/]+/infrastructure/',
          '^src/modules/[^/]+/http/',
          'node_modules/(@hono|hono)/',
        ],
      },
    },
    {
      name: 'adr02-2b-read-port',
      severity: 'error',
      comment: 'ADR 02 #2b: los read ports (application/*.query.ts) solo importan su propio domain + shared. Nunca Hono, infrastructure ni http.',
      from: { path: '^src/modules/([^/]+)/application/[^/]+\\.query\\.ts$' },
      to: { pathNot: ['^src/modules/$1/domain/', '^src/shared/'] },
    },
    {
      name: 'adr02-3-presentation-no-data',
      severity: 'error',
      comment: 'ADR 02 #3: la capa presentation (http/**) no toca DB ni infrastructure (adapter concreto). Única excepción: los archivos *.resource.ts de su propio módulo (declaran la cara pública del recurso: columnMap, searchCols, listQuerySchema). Esos archivos sí pueden tocar shared/db.',
      from: { path: '^src/modules/[^/]+/http/' },
      to: {
        path: [
          '^src/shared/db/',
          '^src/modules/[^/]+/infrastructure/',
        ],
        pathNot: '^src/modules/[^/]+/infrastructure/[^/]+\\.resource\\.ts$',
      },
    },
    {
      name: 'adr02-4-db-only-in-adapter',
      severity: 'error',
      comment: 'ADR 02 #4: solo el adapter (infrastructure/<entity>.repository.bun.ts), el bootstrap del módulo (infrastructure/bootstrap.ts), el resource del módulo (infrastructure/<entity>.resource.ts), src/shared/db o el composition root acceden a Drizzle/DB.',
      from: {
        path: '^src/',
        pathNot: [
          '^src/modules/[^/]+/infrastructure/[^/]+\\.repository\\.bun\\.ts$',
          '^src/modules/[^/]+/infrastructure/[^/]+\\.query\\.drizzle\\.ts$',
          '^src/modules/[^/]+/infrastructure/bootstrap\\.ts$',
          '^src/modules/[^/]+/infrastructure/[^/]+\\.resource\\.ts$',
          '^src/app\\.ts$',
          '^src/shared/db/',
        ],
      },
      to: { path: ['^src/shared/db/', 'node_modules/(drizzle-orm|postgres)/'] },
    },
    {
      name: 'adr02-5-slices-isolated',
      severity: 'error',
      comment: 'ADR 02 #5: un slice no importa NADA de otro slice (sin excepción). La colaboración cross-módulo de lectura no es un import cross-slice: el consumidor lee el schema compartido (src/shared/db) con su propio read-port. El composition root (app.ts) queda exento por no estar bajo src/modules/.',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/([^/]+)/',
        pathNot: ['^src/modules/$1/'],
      },
    },
    {
      name: 'adr02-6-shared-no-modules',
      severity: 'error',
      comment: 'ADR 02 #6: el shared kernel no conoce features.',
      from: { path: '^src/shared/' },
      to: { path: '^src/modules/' },
    },
    {
      name: 'adr02-7-only-root-wires-adapters',
      severity: 'error',
      comment: 'ADR 02 #7: el composition root global (src/app.ts) y el bootstrap por módulo (src/modules/<m>/infrastructure/bootstrap.ts) son los únicos que importan adapters concretos (.repository.bun.ts, .query.drizzle.ts). El bootstrap solo puede cablear los archivos de SU PROPIO módulo.',
      from: {
        path: '^src/',
        pathNot: [
          '^src/app\\.ts$',
          '^src/modules/[^/]+/infrastructure/bootstrap\\.ts$',
        ],
      },
      to: {
        path: [
          '^src/modules/[^/]+/infrastructure/[^/]+\\.repository\\.bun\\.ts$',
          '^src/modules/[^/]+/infrastructure/[^/]+\\.query\\.drizzle\\.ts$',
        ],
      },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Sin dependencias circulares.',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.js', '.json'],
    },
  },
}
