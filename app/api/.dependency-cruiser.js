module.exports = {
  forbidden: [
    {
      name: 'adr02-1-domain-purity',
      severity: 'error',
      comment: 'ADR 02 #1: el conjunto de dominio del slice (agregado, types/, value-objects/, entities/, policies.ts) solo importa dentro de su propio slice de dominio y src/shared/errors.',
      from: {
        path: '^src/modules/([^/]+)/(?:[^/]+\\.ts|types/[^/]+\\.ts|value-objects/[^/]+\\.ts|entities/[^/]+\\.ts|policies\\.ts)$',
        pathNot: '\\.(routes|repository|repository\\.bun)\\.ts$',
      },
      to: { pathNot: ['^src/modules/$1/', '^src/shared/errors/'] },
    },
    {
      name: 'adr02-2-usecases-no-framework',
      severity: 'error',
      comment: 'ADR 02 #2: los use-cases no conocen Hono ni el adapter concreto (*.repository.bun.ts).',
      from: { path: '^src/modules/[^/]+/use-cases/' },
      to: {
        path: [
          '^src/modules/[^/]+/[^/]+\\.repository\\.bun\\.ts$',
          'node_modules/(@hono|hono)/',
        ],
      },
    },
    {
      name: 'adr02-3-routes-no-data',
      severity: 'error',
      comment: 'ADR 02 #3: las rutas no tocan DB ni el adapter concreto directamente.',
      from: { path: '^src/modules/[^/]+/[^/]+\\.routes\\.ts$' },
      to: {
        path: [
          '^src/shared/db/',
          '^src/modules/[^/]+/[^/]+\\.repository\\.bun\\.ts$',
        ],
      },
    },
    {
      name: 'adr02-4-db-only-in-adapter',
      severity: 'error',
      comment: 'ADR 02 #4: solo el adapter (*.repository.bun.ts), src/shared/db o el composition root acceden a Drizzle/DB.',
      from: {
        path: '^src/',
        pathNot: [
          '^src/modules/[^/]+/[^/]+\\.repository\\.bun\\.ts$',
          '^src/app\\.ts$',
          '^src/shared/db/',
        ],
      },
      to: { path: ['^src/shared/db/', 'node_modules/(drizzle-orm|postgres)/'] },
    },
    {
      name: 'adr02-5-slices-isolated',
      severity: 'error',
      comment: 'ADR 02 #5: un slice no importa de otro slice; la colaboración cross-slice pasa por el composition root.',
      from: { path: '^src/modules/([^/]+)/' },
      to: { path: '^src/modules/([^/]+)/', pathNot: '^src/modules/$1/' },
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
      comment: 'ADR 02 #7: solo el composition root (src/app.ts) importa adapters concretos.',
      from: { path: '^src/', pathNot: '^src/app\\.ts$' },
      to: { path: '^src/modules/[^/]+/[^/]+\\.repository\\.bun\\.ts$' },
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
