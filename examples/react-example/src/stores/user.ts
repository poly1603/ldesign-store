import { createReactStore } from '@ldesign/store-react'

/**
 * 用户 Store
 */
export const useUserStore = createReactStore({
  name: 'user',
  initialState: {
    name: '',
    age: 0
  },
  actions: (set, get) => ({
    setName: (name: string) => set({ name }),
    incrementAge: () => set({ age: get().age + 1 })
  }),
  persist: true, // 自动持久化
  cache: {
    maxSize: 50
  }
})

/**
 * 数据 Store（带缓存示例）
 */
export const useDataStore = createReactStore({
  name: 'data',
  initialState: {
    data: null as any,
    loading: false
  },
  actions: (set, get) => ({
    async fetchData(params: any) {
      const store = get()
      const cacheKey = `data:${JSON.stringify(params)}`

      // 检查缓存
      const cached = store.$cache.get(cacheKey)
      if (cached) {
        set({ data: cached })
        return cached
      }

      // 模拟 API 调用
      set({ loading: true })
      await new Promise(resolve => setTimeout(resolve, 500))

      const mockData = {
        id: params.id,
        timestamp: Date.now(),
        message: '这是缓存的数据'
      }

      set({ loading: false, data: mockData })

      // 缓存结果
      store.$cache.set(cacheKey, mockData, 10 * 1000)

      return mockData
    },

    async performanceTest() {
      const store = get()
      return store.$performanceMonitor!.measure('performanceTest', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return 'Performance test completed'
      })
    }
  }),
  cache: {
    maxSize: 100,
    enableStats: true
  },
  enablePerformanceMonitor: true
})
































































