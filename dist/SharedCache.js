"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedStorageAlias = exports.SharedStorage = exports.StorageInitializator = void 0;
const ipc_method_1 = require("@david.uhlir/ipc-method");
const cluster = require("cluster");
exports.StorageInitializator = Symbol();
class SharedStorageHandler {
    constructor() {
        this.storage = {};
    }
    async setValue(key, value, ttl) {
        this.storage[key] = { value, expires: ttl ? Date.now() + ttl : undefined };
    }
    async prolongValue(key, ttl) {
        if (!this.storage[key]) {
            throw new Error(`Key does not exist in shared storage`);
        }
        if (ttl) {
            this.storage[key].expires = Date.now() + ttl;
        }
    }
    async getValue(key, defaultvalue = null) {
        const item = this.storage[key];
        if (item) {
            if (item.expires && Date.now() > item.expires) {
                delete this.storage[key];
                return defaultvalue;
            }
            return item.value;
        }
        return defaultvalue;
    }
    async searchKeys(keyRegexp) {
        const regexp = new RegExp(keyRegexp);
        const result = {};
        for (const key of Object.keys(this.storage)) {
            if (regexp.test(key)) {
                const item = this.storage[key];
                if (item) {
                    if (item.expires && Date.now() > item.expires) {
                        delete this.storage[key];
                    }
                    else {
                        result[key] = item.value;
                    }
                }
            }
        }
        return result;
    }
    async removeKey(key) {
        delete this.storage[key];
    }
    async exists(key) {
        return this.storage.hasOwnProperty(key);
    }
    async check() {
        return true;
    }
}
class SharedStorage {
    static async setValue(key, value, ttl) {
        SharedStorage.storage.setValue(key, value, ttl);
    }
    static async prolongValue(key, ttl) {
        SharedStorage.storage.prolongValue(key, ttl);
    }
    static async getValue(key, defaultvalue = null) {
        return SharedStorage.storage.getValue(key, defaultvalue);
    }
    static async searchKeys(keyRegexp) {
        return SharedStorage.storage.searchKeys(keyRegexp);
    }
    static async removeKey(key) {
        await SharedStorage.storage.removeKey(key);
    }
    static async exists(key) {
        return SharedStorage.storage.exists(key);
    }
    static [exports.StorageInitializator]() {
        if (SharedStorage.storage) {
            return;
        }
        if (!cluster.default.isWorker) {
            SharedStorage.storage = new SharedStorageHandler();
            new ipc_method_1.IpcMethodHandler(['shared-cache-topic'], SharedStorage.storage);
        }
        else {
            const handler = new ipc_method_1.IpcMethodHandler(['shared-cache-topic']);
            SharedStorage.storage = handler.as();
            let storageExist = false;
            SharedStorage.storage
                .check()
                .then(response => (storageExist = response))
                .catch(() => (storageExist = false));
            setTimeout(() => {
                if (storageExist !== true) {
                    console.error(`Shared storage error: Probably run in cluster fork without master code attached! Please add "initMaster()" into master worker.`);
                }
            }, 500);
        }
    }
}
exports.SharedStorage = SharedStorage;
class SharedStorageAlias {
    constructor(prefix) {
        this.prefix = prefix;
    }
    async setValue(key, value, ttl) {
        return SharedStorage.setValue(this.prefix + '/' + key, value, ttl);
    }
    async prolongValue(key, ttl) {
        return SharedStorage.prolongValue(this.prefix + '/' + key, ttl);
    }
    async getValue(key, defaultvalue = null) {
        return SharedStorage.getValue(this.prefix + '/' + key, defaultvalue);
    }
    async getAllKeys(keyRegexp) {
        const allKeys = SharedStorage.searchKeys(this.prefix + '/' + keyRegexp);
        return Object.fromEntries(Object.entries(await allKeys).map(([key, value]) => [key.replace(this.prefix + '/', ''), value]));
    }
    async removeKey(key) {
        return SharedStorage.removeKey(this.prefix + '/' + key);
    }
    async exists(key) {
        return SharedStorage.exists(this.prefix + '/' + key);
    }
}
exports.SharedStorageAlias = SharedStorageAlias;
SharedStorage[exports.StorageInitializator]();
//# sourceMappingURL=SharedCache.js.map