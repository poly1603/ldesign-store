/**
 * Vue 指令
 * 提供声明式的 Store 操作
 */
import type { App, DirectiveBinding } from 'vue';
/**
 * v-store 指令
 * 用于绑定 Store 状态到元素
 */
export declare const vStore: {
    mounted(el: HTMLElement, binding: DirectiveBinding): void;
    unmounted(el: HTMLElement): void;
};
/**
 * v-action 指令
 * 用于绑定 Store 动作到事件
 */
export declare const vAction: {
    mounted(el: HTMLElement, binding: DirectiveBinding): void;
    unmounted(el: HTMLElement): void;
};
/**
 * v-loading 指令
 * 用于显示 Store 动作的加载状态
 */
export declare const vLoading: {
    mounted(el: HTMLElement, binding: DirectiveBinding): void;
    unmounted(el: HTMLElement): void;
};
/**
 * 注册所有指令的插件
 */
export declare function createStoreDirectivesPlugin(): {
    install(app: App): void;
};
/**
 * 指令集合
 */
export declare const storeDirectives: {
    store: {
        mounted(el: HTMLElement, binding: DirectiveBinding): void;
        unmounted(el: HTMLElement): void;
    };
    action: {
        mounted(el: HTMLElement, binding: DirectiveBinding): void;
        unmounted(el: HTMLElement): void;
    };
    loading: {
        mounted(el: HTMLElement, binding: DirectiveBinding): void;
        unmounted(el: HTMLElement): void;
    };
};
