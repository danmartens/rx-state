import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

const external = ['react', 'react/jsx-runtime', 'rxjs'];

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist/esm',
        format: 'esm',
        preserveModules: true,
        exports: 'auto',
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        outDir: 'dist/esm',
      }),
    ],
    external,
  },
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist/cjs',
        format: 'cjs',
        preserveModules: true,
        exports: 'auto',
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        outDir: 'dist/cjs',
      }),
    ],
    external,
  },
]);
