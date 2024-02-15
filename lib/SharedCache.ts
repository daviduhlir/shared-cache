import { IpcMethodHandler } from "@david.uhlir/ipc-method"
import { SharedCacheStorage } from "./SharedCacheStorage"
import * as cluster from 'cluster'

const cacheInitializator = Symbol()

export class SharedCache {
  protected static storage: SharedCacheStorage
  protected static cleanupInterval = null

  /**
   * Get data from cache
   */
  static async getData<T>(key: string, defaultValue?: T): Promise<T> {
    return SharedCache.storage.getData(key, defaultValue)
  }

  /**
   * Set data to cache
   *
   * ttil in miliscconds
   */
  static async setData<T>(key: string, value: T, ttl?: number) {
    SharedCache.storage.setData(key, value, ttl)
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

      SharedCache.cleanupInterval = setInterval(() => SharedCache.storage.cleanup(), 1000)
    } else {
      const handler = new IpcMethodHandler(['shared-cache-topic'])
      SharedCache.storage = handler.as<SharedCacheStorage>() as any
    }
  }
}

SharedCache[cacheInitializator]()
