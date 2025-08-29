import { IpcPublicPromiseMethodsObject } from '@david.uhlir/ipc-method';
export interface Build {
    id: string;
    failedErrorMessage?: string;
}
export declare const StorageInitializator: unique symbol;
declare class SharedStorageHandler {
    protected storage: {
        [key: string]: {
            value: any;
            expires?: number;
        };
    };
    setValue<T = any>(key: string, value: T, ttl?: number): Promise<void>;
    prolongValue(key: string, ttl?: number): Promise<void>;
    getValue<T = any>(key: string, defaultvalue?: T): Promise<T>;
    searchKeys<T = any>(keyRegexp: string): Promise<{
        [key: string]: T;
    }>;
    removeKey(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    check(): Promise<boolean>;
}
export declare class SharedStorage {
    protected static storage: IpcPublicPromiseMethodsObject<SharedStorageHandler>;
    static setValue<T = any>(key: string, value: T, ttl?: number): Promise<void>;
    static prolongValue(key: string, ttl?: number): Promise<void>;
    static getValue<T = any>(key: string, defaultvalue?: T): Promise<T>;
    static searchKeys<T = any>(keyRegexp: string): Promise<{
        [key: string]: T;
    }>;
    static removeKey(key: string): Promise<void>;
    static exists(key: string): Promise<boolean>;
    static [StorageInitializator](): void;
}
export declare class SharedStorageAlias {
    protected prefix: string;
    constructor(prefix: string);
    setValue<T = any>(key: string, value: T, ttl?: number): Promise<void>;
    prolongValue(key: string, ttl?: number): Promise<void>;
    getValue<T = any>(key: string, defaultvalue?: T): Promise<T>;
    getAllKeys<T = any>(keyRegexp: string): Promise<{
        [key: string]: T;
    }>;
    removeKey(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
}
export {};
