import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  
  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
    umd: {
      dir: 'dist',
      name: 'LDesignStore',
    },
  },
  
  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,
  
  external: [
    'vue',
    'react',
    'react-dom',
    /^@ldesign\//,
    /^lodash/,
    /^@vue\//,
  ],
  
  typescript: {
    declaration: true,
    declarationMap: true,
  },
})
