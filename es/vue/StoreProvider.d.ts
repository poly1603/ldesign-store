import type { Pinia, Store } from 'pinia';
import type { App, PropType } from 'vue';
import type { StoreProviderContext, StoreProviderOptions, StoreRegistration } from '../types';
/**
 * Store Provider 组件
 * 提供 Store 的依赖注入功能
 */
export declare const StoreProvider: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    /** Pinia 实例 */
    pinia: {
        type: PropType<Pinia>;
        default: any;
    };
    /** 预定义的 Store */
    stores: {
        type: PropType<Record<string, any>>;
        default: () => {};
    };
    /** 是否全局注册 */
    global: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用开发工具 */
    devtools: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    /** Pinia 实例 */
    pinia: {
        type: PropType<Pinia>;
        default: any;
    };
    /** 预定义的 Store */
    stores: {
        type: PropType<Record<string, any>>;
        default: () => {};
    };
    /** 是否全局注册 */
    global: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用开发工具 */
    devtools: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    devtools: boolean;
    global: boolean;
    pinia: Pinia;
    stores: Record<string, any>;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
/**
 * 使用 Store Provider 的 Hook
 */
export declare function useStoreProvider(): StoreProviderContext;
/**
 * 注册 Store 的 Hook
 */
export declare function useStoreRegistration(): {
    register: (id: string, registration: StoreRegistration) => void;
    getStore: <T extends Store = Store>(id: string) => T | undefined;
    createStore: <T extends Store = Store>(id: string) => T | undefined;
    destroyStore: (id: string) => void;
};
/**
 * Store Provider 插件
 */
export declare function createStoreProviderPlugin(options?: StoreProviderOptions): {
    install(app: App): void;
};
