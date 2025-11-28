import { defineConfig } from '@ldesign/builder'

/**
 * @ldesign/store-vue 构建配置
 *
 * Vue 3 状态管理适配器包
 */
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
      name: 'LDesignStoreVue',
      minify: true,
      globals: {
        'vue': 'Vue',
        'pinia': 'Pinia',
        '@ldesign/store-core': 'LDesignStoreCore',
      },
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
    'vue',
    'pinia',
    '@ldesign/store-core',
    /^node:/,
  ],

  target: 'es2020',
  platform: 'browser',
  comments: 'legal',
})

