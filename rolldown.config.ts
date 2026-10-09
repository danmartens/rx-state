import { defineConfig } from 'rolldown';

const external = /^(react|rxjs|@danmartens\/immutable)(\/|$)/;

export default defineConfig([
  {
    input: 'src/index.ts',
    platform: 'neutral',
    output: {
      dir: 'dist/esm',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      exports: 'auto',
      sourcemap: true,
    },
    external,
  },
  {
    input: 'src/index.ts',
    platform: 'neutral',
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      exports: 'auto',
      sourcemap: true,
    },
    external,
  },
]);
