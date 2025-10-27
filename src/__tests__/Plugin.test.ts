/**
 * Plugin 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PluginManager, createPlugin, loggerPlugin } from '../core/Plugin'

describe('PluginManager', () => {
  let manager: PluginManager

  beforeEach(() => {
    manager = new PluginManager()
  })

  describe('registerPlugin', () => {
    it('应该注册插件', () => {
      const plugin = createPlugin('test', () => { })

      manager.registerPlugin(plugin)

      expect(manager.hasPlugin('test')).toBe(true)
    })

    it('重复注册应该抛出错误', () => {
      const plugin = createPlugin('test', () => { })

      manager.registerPlugin(plugin)

      expect(() => {
        manager.registerPlugin(plugin)
      }).toThrow('already registered')
    })

    it('应该检查依赖', () => {
      const plugin = {
        id: 'dependent',
        dependencies: ['missing'],
        install: () => { },
      }

      expect(() => {
        manager.registerPlugin(plugin)
      }).toThrow('depends on')
    })
  })

  describe('installToStore', () => {
    it('应该安装插件到 Store', async () => {
      const installFn = vi.fn()
      const plugin = createPlugin('test', installFn)

      manager.registerPlugin(plugin)

      const mockStore = {
        $id: 'test-store',
        $subscribe: vi.fn(() => () => { }),
        $onAction: vi.fn(() => () => { }),
        $state: {},
      }

      await manager.installToStore(mockStore, 'test')

      expect(installFn).toHaveBeenCalled()
      expect(manager.isInstalled(mockStore, 'test')).toBe(true)
    })

    it('应该自动安装依赖插件', async () => {
      const dep = createPlugin('dependency', vi.fn())
      const plugin = {
        id: 'main',
        dependencies: ['dependency'],
        install: vi.fn(),
      }

      manager.registerPlugin(dep)
      manager.registerPlugin(plugin)

      const mockStore = {
        $id: 'test-store',
        $subscribe: vi.fn(() => () => { }),
        $onAction: vi.fn(() => () => { }),
        $state: {},
      }

      await manager.installToStore(mockStore, 'main')

      expect(manager.isInstalled(mockStore, 'dependency')).toBe(true)
      expect(manager.isInstalled(mockStore, 'main')).toBe(true)
    })
  })

  describe('uninstallFromStore', () => {
    it('应该卸载插件', async () => {
      const uninstallFn = vi.fn()
      const plugin = {
        id: 'test',
        install: vi.fn(),
        uninstall: uninstallFn,
      }

      manager.registerPlugin(plugin)

      const mockStore = {
        $id: 'test-store',
        $subscribe: vi.fn(() => () => { }),
        $onAction: vi.fn(() => () => { }),
        $state: {},
      }

      await manager.installToStore(mockStore, 'test')
      await manager.uninstallFromStore(mockStore, 'test')

      expect(uninstallFn).toHaveBeenCalled()
      expect(manager.isInstalled(mockStore, 'test')).toBe(false)
    })
  })

  describe('getPluginInfo', () => {
    it('应该返回插件信息', () => {
      const plugin = {
        id: 'test',
        name: '测试插件',
        version: '1.0.0',
        description: '这是一个测试插件',
        install: () => { },
      }

      manager.registerPlugin(plugin)

      const info = manager.getPluginInfo('test')

      expect(info).toMatchObject({
        id: 'test',
        name: '测试插件',
        version: '1.0.0',
        description: '这是一个测试插件',
      })
    })
  })

  describe('getStats', () => {
    it('应该返回统计信息', async () => {
      const plugin1 = createPlugin('plugin1', () => { })
      const plugin2 = createPlugin('plugin2', () => { })

      manager.registerPlugin(plugin1)
      manager.registerPlugin(plugin2)

      const mockStore = {
        $id: 'test-store',
        $subscribe: vi.fn(() => () => { }),
        $onAction: vi.fn(() => () => { }),
        $state: {},
      }

      await manager.installToStore(mockStore, 'plugin1')

      const stats = manager.getStats()

      expect(stats.totalPlugins).toBe(2)
      expect(stats.plugins.find(p => p.id === 'plugin1')?.installedCount).toBe(1)
    })
  })
})

describe('内置插件', () => {
  describe('loggerPlugin', () => {
    it('应该有正确的元数据', () => {
      expect(loggerPlugin.id).toBe('logger')
      expect(loggerPlugin.name).toBe('日志插件')
      expect(loggerPlugin.install).toBeDefined()
    })
  })
})


