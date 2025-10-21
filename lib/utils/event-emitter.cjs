/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

class EventEmitter {
  constructor() {
    this.events = {};
    this.maxListeners = 100;
    this.eventCount = 0;
  }
  /**
   * 订阅事件
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
      this.eventCount++;
    }
    if (this.events[event].length >= this.maxListeners) {
      console.warn(`Warning: Event '${event}' has ${this.events[event].length} listeners. Possible memory leak detected.`);
    }
    this.events[event].push(listener);
  }
  /**
   * 触发事件
   */
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(...args));
    }
  }
  /**
   * 取消订阅事件
   */
  off(event, listener) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((l) => l !== listener);
      if (this.events[event].length === 0) {
        delete this.events[event];
        this.eventCount--;
      }
    }
  }
  /**
   * 订阅一次性事件
   */
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }
  /**
   * 移除所有事件监听器
   */
  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
      this.eventCount--;
    } else {
      this.events = {};
      this.eventCount = 0;
    }
  }
  /**
   * 获取事件监听器数量
   */
  listenerCount(event) {
    return this.events[event]?.length || 0;
  }
  /**
   * 获取所有事件名称
   */
  eventNames() {
    return Object.keys(this.events);
  }
  /**
   * 设置最大监听器数量
   */
  setMaxListeners(max) {
    this.maxListeners = max;
  }
  /**
   * 获取事件统计信息
   */
  getStats() {
    let totalListeners = 0;
    for (const event in this.events) {
      totalListeners += this.events[event].length;
    }
    return { eventCount: this.eventCount, totalListeners };
  }
  /**
   * 销毁事件发射器
   */
  dispose() {
    this.removeAllListeners();
  }
}

exports.EventEmitter = EventEmitter;
//# sourceMappingURL=event-emitter.cjs.map
