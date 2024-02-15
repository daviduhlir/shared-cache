"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedCacheStorage = void 0;
class SharedCacheStorage {
    constructor() {
        this.data = {};
    }
    async getData(key, defaultValue) {
        const item = this.data.hasOwnProperty(key) ? this.data[key] : null;
        if (item.expiration && item.expiration < Date.now()) {
            delete this.data[key];
            return defaultValue;
        }
        return item ? item?.value : defaultValue;
    }
    async setData(key, value, ttl) {
        this.data[key] = {
            expiration: ttl ? Date.now() + ttl : undefined,
            value,
        };
    }
    async removeData(key) {
        delete this.data[key];
    }
    async cleanup() {
        const keys = Object.keys(this.data);
        for (const key of keys) {
            const item = this.data[key];
            if (item.expiration && item.expiration < Date.now()) {
                delete this.data[key];
            }
        }
    }
    dump() {
        console.log(this.data);
    }
}
exports.SharedCacheStorage = SharedCacheStorage;
//# sourceMappingURL=SharedCacheStorage.js.map