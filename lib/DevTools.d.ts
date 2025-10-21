/**
 * Developer Tools and Debugging Suite
 * 提供可视化调试、状态检查和开发工具集成
 */
import { EventEmitter } from './utils/event-emitter';
interface StoreSnapshot {
    id: string;
    timestamp: number;
    state: any;
    computed: Record<string, any>;
    metadata: {
        actionName?: string;
        actionArgs?: any[];
        duration?: number;
        error?: Error;
    };
}
interface DevToolsConfig {
    name?: string;
    maxHistory?: number;
    logActions?: boolean;
    logState?: boolean;
    enableTimeTravel?: boolean;
    enableHotReload?: boolean;
    port?: number;
}
interface StoreInspection {
    state: any;
    computed: Record<string, any>;
    actions: string[];
    watchers: Array<{
        path: string;
        callback: string;
    }>;
    subscribers: number;
    history: StoreSnapshot[];
}
export declare class DevToolsConnection extends EventEmitter {
    private port;
    private ws?;
    private reconnectTimer?;
    private isConnected;
    private messageQueue;
    constructor(port?: number);
    private connect;
    private scheduleReconnect;
    private flushMessageQueue;
    send(message: any): void;
    disconnect(): void;
}
export declare class StoreDevTools extends EventEmitter {
    private stores;
    private history;
    private connection?;
    private config;
    private timeTravelIndex;
    private watchers;
    private subscribers;
    constructor(config?: DevToolsConfig);
    private setupConnection;
    private setupGlobalHooks;
    registerStore(name: string, store: any): void;
    private interceptActions;
    private watchStateChanges;
    private trackSubscribers;
    private recordSnapshot;
    private cloneState;
    private getComputedValues;
    timeTravel(storeName: string, direction: 'forward' | 'backward' | number): void;
    inspect(storeName: string): StoreInspection | null;
    hotReload(storeName: string, newModule: any): void;
    private handleDevToolsMessage;
    private sendStoreUpdate;
    private sendSnapshot;
    private syncAllStores;
    exportState(storeName?: string): any;
    importState(storeName: string, state: any): void;
    destroy(): void;
}
export declare class ConsoleFormatter {
    static setup(): void;
}
export declare class VisualInspector {
    private overlay?;
    private isActive;
    activate(): void;
    private createOverlay;
    private setupEventListeners;
    toggle(): void;
    updateContent(): void;
    destroy(): void;
}
export declare function initDevTools(config?: DevToolsConfig): StoreDevTools;
export declare function getDevTools(): StoreDevTools | null;
export {};
