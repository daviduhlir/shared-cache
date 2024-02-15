import { SharedCacheStorage } from "./SharedCacheStorage";
declare const cacheInitializator: unique symbol;
export declare class SharedCache {
    protected static storage: SharedCacheStorage;
    protected static cleanupInterval: any;
    static getData<T>(key: string, defaultValue?: T): Promise<T>;
    static setData<T>(key: string, value: T, ttl?: number): Promise<void>;
    static [cacheInitializator](): void;
}
export {};
