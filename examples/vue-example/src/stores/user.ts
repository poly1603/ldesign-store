import { createVueStore } from '@ldesign/store-vue'

/**
 * 用户 Store
 */
export const useUserStore = createVueStore({
  id: 'user',
  state: () => ({
    name: '',
    age: 0
  }),
  actions: {
    setName(name: string) {
      this.name = name
    },
    incrementAge() {
      this.age++
    }
  },
  getters: {
    displayName: (state) => state.name ? `用户: ${state.name}` : '未登录'
  },
  persist: true, // 自动持久化
  cache: {
    maxSize: 50,
    defaultTTL: 5 * 60 * 1000
  }
})

/**
 * 数据 Store（带缓存示例）
 */
export const useDataStore = createVueStore({
  id: 'data',
  state: () => ({
    data: null as any,
    loading: false
  }),
  actions: {
    async fetchData(params: any) {
      const cacheKey = `data:${JSON.stringify(params)}`

      // 检查缓存
      const cached = this.$cache.get(cacheKey)
      if (cached) {
        this.data = cached
        return cached
      }

      // 模拟 API 调用
      this.loading = true
      await new Promise(resolve => setTimeout(resolve, 500))

      const mockData = {
        id: params.id,
        timestamp: Date.now(),
        message: '这是缓存的数据'
      }

      this.loading = false
      this.data = mockData

      // 缓存结果
      this.$cache.set(cacheKey, mockData, 10 * 1000) // 缓存 10 秒

      return mockData
    },

    async performanceTest() {
      return this.$performanceMonitor!.measure('performanceTest', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return 'Performance test completed'
      })
    }
  },
  cache: {
    maxSize: 100,
    enableStats: true
  },
  enablePerformanceMonitor: true
})














