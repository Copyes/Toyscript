import { arrayMethods } from './array'
import { def, hasOwn, isObject, isPlainObject } from './dep'

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)
// can we use __proto__?
export const hasProto = '__proto__' in {}
export class Observer {
  constructor(value) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      const augment = hasProto ? protoAugment : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; ++i) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }

  observeArray(items) {
    for (let i = 0, l = items.length; i < l; ++i) {
      observe(items[i])
    }
  }
}
/**
 * 直接覆盖原型的方法来修改目标对象或数组
 * @param {*} target
 * @param {*} src
 */
function protoAugment(target, src) {
  target.__proto__ = src
}
/**
 * 定义（覆盖）目标对象或数组的某一个方法
 * @param {*} target
 * @param {*} src
 * @param {*} keys
 */
function copyAugment(target, src, keys) {
  for (let i = 0, l = keys.length; i < l; ++i) {
    const key = keys[i]
    def(target, key, src[key])
  }
}
export function observe(value) {
  if (!isObject(value)) return
  let ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }

  return ob
}

export function defineReactive(obj, key, val) {
  const dep = new Dep()
  const property = Object.getOwnPropertyDescriptor(obj, key)

  if (property && property.configurable === false) return

  const setter = property && property.set
  const getter = property && property.get

  let childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        Dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val
      if (newVal === value || (newVal !== newVal && value !== value)) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = observe(newVal)
      dep.notify()
    }
  })
}

export function dependArray(value) {
  for (let e, i = 0, l = value.length; i < l; ++i) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}
