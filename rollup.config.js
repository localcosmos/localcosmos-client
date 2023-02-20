import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

import { terser } from 'rollup-plugin-terser';
import pkg from './package.json' assert { type: 'json' };

export default [
  {
    input: 'src/index.ts',
    output: {
      name: pkg.name,
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      resolve(),
      typescript(),
      terser(),
    ],
  },
  {
    input: 'src/index.ts',
    plugins: [
      typescript(),
      terser(),
    ],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
  },
];
