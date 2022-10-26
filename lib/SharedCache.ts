import { IpcMethodHandler } from "@david.uhlir/ipc-method"
import { SharedCacheStorage } from "./SharedCachStorage"
import * as cluster from 'cluster'

const cacheInitializator = Symbol()

export class SharedCache {
  protected static storage: SharedCacheStorage

  /**
   * Get data from cache
   */
  static async getData<T>(key: string, defaultValue?: T): Promise<T> {
    return SharedCache.storage.getData(key, defaultValue)
  }

  /**
   * Set data to cache
   */
  static async setData<T>(key: string, value: T) {
    SharedCache.storage.getData(key, value)
  }

  /**
   * Internal initializator
   */
  static [cacheInitializator]() {
    if (SharedCache.storage) {
      return
    }

    if (cluster.isMaster) {
      SharedCache.storage = new SharedCacheStorage()
      new IpcMethodHandler(['shared-cache-topic'], SharedCache.storage as any)
    } else {
      const handler = new IpcMethodHandler(['shared-cache-topic'])
      SharedCache.storage = handler.as<SharedCacheStorage>() as any
    }
  }
}

SharedCache[cacheInitializator]()
