import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: ['src/index.ts'],
  output: {
    dir: 'dist',
    format: 'commonjs',
    preserveModules: true,
    exports: 'auto',
    sourcemap: true,
  },
  external: ['react', 'react/jsx-runtime', 'rxjs'],
  plugins: [
    typescript({
      jsx: 'react-jsx',
      emitDeclarationOnly: true,
      exclude: [
        'src/**/*.stories.tsx',
        'types',
        'jest-setup.ts',
        'rollup.config.ts',
      ],
    }),
  ],
});
