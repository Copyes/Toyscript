import Watcher from './observer/watcher'
import { observe } from './observer/index'

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  set: function() {},
  set: function() {}
}
export function proxy(target, sourceKey, key) {
  sharedPropertyDefinition.get = function() {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function(val) {
    this[sourceKey][key] = val
  }

  Object.defineProperty(target, key, sharedPropertyDefinition)
}
export default class Frankxx {
  constructor(options = {}) {
    this._init(options)
  }
  _init(options) {
    this.$option = options
    let data
    if (typeof options.data === 'function') {
      this._data = data = options.data()
    } else {
      this._data = data = options.data
    }
    const keys = Object.keys(data)
    let i = keys.length
    while (i--) {
      proxy(this, `_data`, keys[i])
    }
    observe(data, true)
    this.$mount()
  }
  $watch(expOrFn, cb, options) {
    return new Watcher(this, expOrFn, cb)
  }
  $mount() {
    let vm = this
    let updateComponent = function() {
      console.log('这里会调用vm._update提示数据变化,告诉vue该渲染了')
    }
    vm._watchers = []
    new Watcher(vm, updateComponent, function() {}, null, true)
  }
}
