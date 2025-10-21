import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

// 导入样式
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 可以在这里注册全局组件
  },
} satisfies Theme
