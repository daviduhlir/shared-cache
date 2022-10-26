"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedCacheStorage = void 0;
class SharedCacheStorage {
    constructor() {
        this.data = {};
    }
    async getData(key, defaultValue) {
        return this.data.hasOwnProperty(key) ? this.data[key] : defaultValue;
    }
    async setData(key, value) {
        this.data[key] = value;
    }
    dump() {
        console.log(this.data);
    }
}
exports.SharedCacheStorage = SharedCacheStorage;
//# sourceMappingURL=SharedCachStorage.js.map