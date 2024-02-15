export declare class SharedCacheStorage {
    protected data: {};
    getData<T>(key: string, defaultValue?: T): Promise<T>;
    setData<T>(key: string, value: T, ttl?: number): Promise<void>;
    removeData(key: string): Promise<void>;
    cleanup(): Promise<void>;
    dump(): void;
}
