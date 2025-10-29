import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  output: {
    formats: ['esm', 'cjs', 'dts'],
    dir: 'dist'
  },
  dts: {
    enabled: true
  },
  minify: true,
  sourcemap: true
})


