export class SharedCacheStorage {
  protected data = {}

  async getData<T>(key: string, defaultValue?: T): Promise<T> {
    const item = this.data.hasOwnProperty(key) ? this.data[key] : null
    if (item.expiration && item.expiration > Date.now()) {
      delete this.data[key]
      return defaultValue
    }
    return item ? item?.value : defaultValue
  }

  async setData<T>(key: string, value: T, ttl?: number) {
    this.data[key] = {
      expiration: ttl ? Date.now() + ttl : undefined,
      value,
    }
  }

  async removeData(key: string) {
    delete this.data[key]
  }

  async cleanup() {
    const keys = Object.keys(this.data)
    for(const key of keys) {
      const item = this.data[key]
      if (item.expiration && item.expiration > Date.now()) {
        delete this.data[key]
      }
    }
  }

  dump() {
    console.log(this.data)
  }
}
