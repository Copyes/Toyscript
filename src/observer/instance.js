import Watcher from './watcher'
import { observe } from './index'

export default class Frankxx {
  constructor(options = {}) {
    this.$option = options
    let data = (this._data = this.$option.data)
    Object.keys(data).forEach(key => this._proxy(key))
    observe(data)
  }
  $watch(expOrFn, cb, options) {
    new Watcher(this, expOrFn, cb)
  }
  _proxy(key) {
    Object.defineProperty(this, key, {
      enumerable: true,
      configurable: true,
      get: function proxyGetter() {
        return this._data[key]
      },
      set: function proxySetter(newVal) {
        this._data[key] = newVal
      }
    })
  }
}
