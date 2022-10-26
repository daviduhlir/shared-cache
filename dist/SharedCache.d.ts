import { SharedCacheStorage } from "./SharedCachStorage";
declare const cacheInitializator: unique symbol;
export declare class SharedCache {
    protected static storage: SharedCacheStorage;
    static getData<T>(key: string, defaultValue?: T): Promise<T>;
    static setData<T>(key: string, value: T): Promise<void>;
    static [cacheInitializator](): void;
}
export {};
