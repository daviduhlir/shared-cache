import { IpcMethodHandler, IpcPublicPromiseMethodsObject } from '@david.uhlir/ipc-method'
import * as clusterRaw from 'cluster'
const cluster: typeof clusterRaw.default = clusterRaw as any

export interface Build {
  id: string
  failedErrorMessage?: string
}

export const StorageInitializator = Symbol()

/**
 * Internal storage for master
 */
class SharedStorageHandler {
  protected storage: {
    [key: string]: {
      value: any
      expires?: number
    }
  } = {}

  async setValue<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    this.storage[key] = { value, expires: ttl ? Date.now() + ttl : undefined }
  }

  async prolongValue(key: string, ttl?: number): Promise<void> {
    if (!this.storage[key]) {
      throw new Error(`Key does not exist in shared storage`)
    }
    if (ttl) {
      this.storage[key].expires = Date.now() + ttl
    }
  }

  async getValue<T = any>(key: string, defaultvalue: T = null): Promise<T> {
    const item = this.storage[key]
    if (item) {
      if (item.expires && Date.now() > item.expires) {
        delete this.storage[key] // remove expired item
        return defaultvalue
      }
      return item.value as T
    }
    return defaultvalue
  }

  async searchKeys<T = any>(keyRegexp: string): Promise<{ [key: string]: T }> {
    const regexp = new RegExp(keyRegexp)
    const result: { [key: string]: T } = {}
    for (const key of Object.keys(this.storage)) {
      if (regexp.test(key)) {
        const item = this.storage[key]
        if (item) {
          if (item.expires && Date.now() > item.expires) {
            delete this.storage[key] // remove expired item
          } else {
            result[key] = item.value as T
          }
        }
      }
    }
    return result
  }

  async removeKey(key: string): Promise<void> {
    delete this.storage[key]
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.hasOwnProperty(key)
  }

  async check(): Promise<boolean> {
    return true
  }
}

/**
 * Active builds manager supporting run in clusters
 */
export class SharedStorage {
  protected static storage: IpcPublicPromiseMethodsObject<SharedStorageHandler>

  static async setValue<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    SharedStorage.storage.setValue<T>(key, value, ttl)
  }

  static async prolongValue(key: string, ttl?: number): Promise<void> {
    SharedStorage.storage.prolongValue(key, ttl)
  }

  static async getValue<T = any>(key: string, defaultvalue: T = null): Promise<T> {
    return SharedStorage.storage.getValue<T>(key, defaultvalue)
  }

  static async searchKeys<T = any>(keyRegexp: string): Promise<{ [key: string]: T }> {
    return SharedStorage.storage.searchKeys<T>(keyRegexp)
  }

  static async removeKey(key: string): Promise<void> {
    await SharedStorage.storage.removeKey(key)
  }

  static async exists(key: string): Promise<boolean> {
    return SharedStorage.storage.exists(key)
  }

  /**
   * Internal initializator
   */
  static [StorageInitializator](): void {
    if (SharedStorage.storage) {
      return
    }

    if (!cluster.isWorker) {
      SharedStorage.storage = new SharedStorageHandler()
      new IpcMethodHandler(['shared-cache-topic'], SharedStorage.storage)
    } else {
      const handler = new IpcMethodHandler(['shared-cache-topic'])
      SharedStorage.storage = handler.as<SharedStorageHandler>() as any

      // check if master is attached
      let storageExist = false
      SharedStorage.storage
        .check()
        .then(response => (storageExist = response))
        .catch(() => (storageExist = false))
      setTimeout(() => {
        if (storageExist !== true) {
          console.error(
            `Shared storage error: Probably run in cluster fork without master code attached! Please add "initMaster()" into master worker.`,
          )
        }
      }, 500)
    }
  }
}

export class SharedStorageAlias {
  constructor(protected prefix: string) {}
  async setValue<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    return SharedStorage.setValue<T>(this.prefix + '/' + key, value, ttl)
  }
  async prolongValue(key: string, ttl?: number): Promise<void> {
    return SharedStorage.prolongValue(this.prefix + '/' + key, ttl)
  }
  async getValue<T = any>(key: string, defaultvalue: T = null): Promise<T> {
    return SharedStorage.getValue<T>(this.prefix + '/' + key, defaultvalue)
  }
  async getAllKeys<T = any>(keyRegexp: string): Promise<{ [key: string]: T }> {
    const allKeys = SharedStorage.searchKeys<T>(this.prefix + '/' + keyRegexp)
    return Object.fromEntries(Object.entries(await allKeys).map(([key, value]) => [key.replace(this.prefix + '/', ''), value]))
  }
  async removeKey(key: string): Promise<void> {
    return SharedStorage.removeKey(this.prefix + '/' + key)
  }
  async exists(key: string): Promise<boolean> {
    return SharedStorage.exists(this.prefix + '/' + key)
  }
}

SharedStorage[StorageInitializator]()

export class SharedCache extends SharedStorage {
  static async setData<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    return SharedStorage.setValue<T>('data/' + key, value, ttl)
  }

  static async getData<T = any>(key: string, defaultvalue: T = null): Promise<T> {
    return SharedStorage.getValue<T>('data/' + key, defaultvalue)
  }

  static async removeData(key: string): Promise<void> {
    return SharedStorage.removeKey('data/' + key)
  }

  static async existsData(key: string): Promise<boolean> {
    return SharedStorage.exists('data/' + key)
  }
}
