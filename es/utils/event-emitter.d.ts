/**
 * 事件监听器函数类型
 */
export type EventListener = (...args: any[]) => void;
/**
 * 事件发射器
 * 提供简单的事件订阅和触发机制
 */
export declare class EventEmitter {
    private events;
    private maxListeners;
    private eventCount;
    /**
     * 订阅事件
     */
    on(event: string, listener: EventListener): void;
    /**
     * 触发事件
     */
    emit(event: string, ...args: any[]): void;
    /**
     * 取消订阅事件
     */
    off(event: string, listener: EventListener): void;
    /**
     * 订阅一次性事件
     */
    once(event: string, listener: EventListener): void;
    /**
     * 移除所有事件监听器
     */
    removeAllListeners(event?: string): void;
    /**
     * 获取事件监听器数量
     */
    listenerCount(event: string): number;
    /**
     * 获取所有事件名称
     */
    eventNames(): string[];
    /**
     * 设置最大监听器数量
     */
    setMaxListeners(max: number): void;
    /**
     * 获取事件统计信息
     */
    getStats(): {
        eventCount: number;
        totalListeners: number;
    };
    /**
     * 销毁事件发射器
     */
    dispose(): void;
}
