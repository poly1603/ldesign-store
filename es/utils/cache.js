/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class LRUNode {
  constructor(key, value, timestamp, ttl, prev = null, next = null) {
    this.key = key;
    this.value = value;
    this.timestamp = timestamp;
    this.ttl = ttl;
    this.prev = prev;
    this.next = next;
  }
}
class LRUCache {
  constructor(maxSize = 1e3, defaultTTL = 5 * 60 * 1e3) {
    this.cache = /* @__PURE__ */ new Map();
    this.head = null;
    this.tail = null;
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.startCleanup();
  }
  /**
   * 设置缓存
   */
  set(key, value, ttl) {
    const now = Date.now();
    const existingNode = this.cache.get(key);
    if (existingNode) {
      existingNode.value = value;
      existingNode.timestamp = now;
      existingNode.ttl = ttl ?? this.defaultTTL;
      this.moveToHead(existingNode);
    } else {
      const newNode = new LRUNode(key, value, now, ttl ?? this.defaultTTL);
      this.cache.set(key, newNode);
      this.addToHead(newNode);
      if (this.cache.size > this.maxSize) {
        this.removeTail();
      }
    }
  }
  /**
   * 获取缓存
   */
  get(key) {
    const node = this.cache.get(key);
    if (!node)
      return void 0;
    const now = Date.now();
    if (node.ttl && now - node.timestamp > node.ttl) {
      this.remove(key);
      return void 0;
    }
    this.moveToHead(node);
    return node.value;
  }
  /**
   * 检查缓存是否存在且未过期
   */
  has(key) {
    const node = this.cache.get(key);
    if (!node)
      return false;
    const now = Date.now();
    if (node.ttl && now - node.timestamp > node.ttl) {
      this.remove(key);
      return false;
    }
    return true;
  }
  /**
   * 删除缓存
   */
  delete(key) {
    return this.remove(key);
  }
  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }
  /**
   * 获取缓存大小
   */
  size() {
    return this.cache.size;
  }
  /**
   * 获取所有键
   */
  keys() {
    return Array.from(this.cache.keys());
  }
  /**
   * 销毁缓存，清理资源
   */
  dispose() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = void 0;
    }
    this.clear();
  }
  /**
   * 添加节点到头部
   */
  addToHead(node) {
    node.prev = null;
    node.next = this.head;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }
  /**
   * 移除节点
   */
  removeNode(node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }
  /**
   * 移动节点到头部
   */
  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }
  /**
   * 移除尾部节点
   */
  removeTail() {
    if (!this.tail)
      return;
    const key = this.tail.key;
    this.removeNode(this.tail);
    this.cache.delete(key);
  }
  /**
   * 删除指定键
   */
  remove(key) {
    const node = this.cache.get(key);
    if (!node)
      return false;
    this.removeNode(node);
    this.cache.delete(key);
    return true;
  }
  /**
   * 启动定期清理
   */
  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 6e4);
  }
  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];
    for (const [key, node] of this.cache.entries()) {
      if (node.ttl && now - node.timestamp > node.ttl) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.remove(key));
  }
}
function fastHash(value) {
  if (value === null)
    return "null";
  if (value === void 0)
    return "undefined";
  const type = typeof value;
  if (type === "string")
    return value;
  if (type === "number" || type === "boolean")
    return String(value);
  if (type === "object") {
    if (Array.isArray(value)) {
      return value.map(fastHash).join(",");
    }
    const keys = Object.keys(value).sort();
    return keys.map((k) => `${k}:${fastHash(value[k])}`).join("|");
  }
  return String(value);
}
class ObjectPool {
  constructor(factory, reset, maxSize = 100, preallocateSize = 10) {
    this.pool = [];
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
    this.preallocateSize = Math.min(preallocateSize, maxSize);
    this.preallocate();
  }
  /**
   * 预分配对象（性能优化）
   */
  preallocate() {
    for (let i = 0; i < this.preallocateSize; i++) {
      this.pool.push(this.factory());
    }
  }
  /**
   * 获取对象
   */
  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.factory();
  }
  /**
   * 释放对象
   */
  release(obj) {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }
  /**
   * 清空对象池
   */
  clear() {
    this.pool.length = 0;
  }
  /**
   * 获取池大小
   */
  size() {
    return this.pool.length;
  }
}

export { LRUCache, ObjectPool, fastHash };
//# sourceMappingURL=cache.js.map
