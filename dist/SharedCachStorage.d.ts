export declare class SharedCacheStorage {
    protected data: {};
    getData<T>(key: string, defaultValue?: T): Promise<T>;
    setData<T>(key: string, value: T): Promise<void>;
    dump(): void;
}
