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

var provider = require('../types/provider.cjs');
var composables = require('./composables.cjs');
var directives = require('./directives.cjs');
var helpers = require('./helpers.cjs');
var StoreProvider = require('./StoreProvider.cjs');



exports.STORE_PROVIDER_KEY = provider.STORE_PROVIDER_KEY;
exports.useAction = composables.useAction;
exports.useAsyncAction = composables.useAsyncAction;
exports.useBatch = composables.useBatch;
exports.useComputed = composables.useComputed;
exports.useGetter = composables.useGetter;
exports.usePersist = composables.usePersist;
exports.useReactiveState = composables.useReactiveState;
exports.useSimpleStore = composables.useSimpleStore;
exports.useState = composables.useState;
exports.useStore = composables.useStore;
exports.createStoreDirectivesPlugin = directives.createStoreDirectivesPlugin;
exports.storeDirectives = directives.storeDirectives;
exports.vAction = directives.vAction;
exports.vLoading = directives.vLoading;
exports.vStore = directives.vStore;
exports.StoreManager = helpers.StoreManager;
exports.createAutoStorePlugin = helpers.createAutoStorePlugin;
exports.createReactiveStore = helpers.createReactiveStore;
exports.createSimpleStore = helpers.createSimpleStore;
exports.createStores = helpers.createStores;
exports.globalStoreManager = helpers.globalStoreManager;
exports.StoreProvider = StoreProvider.StoreProvider;
exports.createStoreProviderPlugin = StoreProvider.createStoreProviderPlugin;
exports.useStoreProvider = StoreProvider.useStoreProvider;
exports.useStoreRegistration = StoreProvider.useStoreRegistration;
//# sourceMappingURL=index.cjs.map
