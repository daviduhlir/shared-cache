"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedCache = void 0;
const ipc_method_1 = require("@david.uhlir/ipc-method");
const SharedCachStorage_1 = require("./SharedCachStorage");
const cluster = require("cluster");
const cacheInitializator = Symbol();
class SharedCache {
    static async getData(key, defaultValue) {
        return SharedCache.storage.getData(key, defaultValue);
    }
    static async setData(key, value) {
        SharedCache.storage.setData(key, value);
    }
    static [cacheInitializator]() {
        if (SharedCache.storage) {
            return;
        }
        if (cluster.isMaster) {
            SharedCache.storage = new SharedCachStorage_1.SharedCacheStorage();
            new ipc_method_1.IpcMethodHandler(['shared-cache-topic'], SharedCache.storage);
        }
        else {
            const handler = new ipc_method_1.IpcMethodHandler(['shared-cache-topic']);
            SharedCache.storage = handler.as();
        }
    }
}
exports.SharedCache = SharedCache;
SharedCache[cacheInitializator]();
//# sourceMappingURL=SharedCache.js.map