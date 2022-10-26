export class SharedCacheStorage {
  protected data = {}

  async getData<T>(key: string, defaultValue?: T): Promise<T> {
    return this.data.hasOwnProperty(key) ? this.data[key] : defaultValue
  }

  async setData<T>(key: string, value: T) {
    this.data[key] = value
  }

  dump() {
    console.log(this.data)
  }
}
