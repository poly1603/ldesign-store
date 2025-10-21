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

var decorators = require('./decorators.cjs');
var provider = require('./provider.cjs');

exports.CacheStrategy = void 0;
(function(CacheStrategy2) {
  CacheStrategy2["LRU"] = "lru";
  CacheStrategy2["FIFO"] = "fifo";
  CacheStrategy2["LFU"] = "lfu";
})(exports.CacheStrategy || (exports.CacheStrategy = {}));

exports.DECORATOR_METADATA_KEY = decorators.DECORATOR_METADATA_KEY;
exports.STORE_PROVIDER_KEY = provider.STORE_PROVIDER_KEY;
//# sourceMappingURL=index.cjs.map
