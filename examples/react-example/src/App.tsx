import React, { useState } from 'react'
import { useUserStore, useDataStore } from './stores/user'

function App() {
  const { name, age, setName, incrementAge } = useUserStore()
  const dataStore = useDataStore()
  const [nameInput, setNameInput] = useState('')
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null)

  const handleSetName = () => {
    if (nameInput) {
      setName(nameInput)
      setNameInput('')
    }
  }

  const handleFetchData = async () => {
    await dataStore.fetchData({ id: Math.random() })
  }

  const handlePerformanceTest = async () => {
    await dataStore.performanceTest()
    const metrics = dataStore.$performanceMonitor?.getMetrics('performanceTest')
    setPerformanceMetrics(metrics)
  }

  const cacheStats = dataStore.$cache.getStats()

  return (
    <div className="app">
      <h1>@ldesign/store-react 示例</h1>

      <div className="card">
        <h2>用户信息</h2>
        <p>姓名: {name || '未设置'}</p>
        <p>年龄: {age}</p>
        <p>显示名称: {name ? `用户: ${name}` : '未登录'}</p>

        <div className="actions">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSetName()}
            placeholder="输入姓名"
          />
          <button onClick={handleSetName}>设置姓名</button>
          <button onClick={incrementAge}>增加年龄</button>
        </div>
      </div>

      <div className="card">
        <h2>缓存示例</h2>
        <button onClick={handleFetchData}>获取数据（带缓存）</button>
        {dataStore.loading && <div>加载中...</div>}
        {dataStore.data && (
          <pre>{JSON.stringify(dataStore.data, null, 2)}</pre>
        )}

        <div className="stats">
          <h3>缓存统计</h3>
          <p>命中率: {(cacheStats.hitRate * 100).toFixed(2)}%</p>
          <p>总请求: {cacheStats.totalRequests}</p>
          <p>命中: {cacheStats.hits}</p>
          <p>未命中: {cacheStats.misses}</p>
        </div>
      </div>

      <div className="card">
        <h2>性能监控</h2>
        <button onClick={handlePerformanceTest}>运行性能测试</button>
        {performanceMetrics && (
          <div>
            <p>平均耗时: {performanceMetrics.avgTime.toFixed(2)}ms</p>
            <p>最小耗时: {performanceMetrics.minTime.toFixed(2)}ms</p>
            <p>最大耗时: {performanceMetrics.maxTime.toFixed(2)}ms</p>
            <p>执行次数: {performanceMetrics.count}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App








































