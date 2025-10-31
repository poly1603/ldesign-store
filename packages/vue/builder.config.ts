import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  output: {
    formats: ['esm', 'cjs', 'dts'],
    dir: 'dist'
  },
  external: ['vue', 'pinia', '@ldesign/store-core'],
  dts: {
    enabled: true
  },
  minify: true,
  sourcemap: true
})




