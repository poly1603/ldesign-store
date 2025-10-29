import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: false,
  ignores: ['dist', 'node_modules', '*.md']
})



