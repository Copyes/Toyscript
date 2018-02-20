export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

const hasOwnProperty = Object.prototype.hasOwnProperty
const _toString = Object.prototype.toString

export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key)
}

export function isObject(val) {
  return obj !== null && typeof obj === 'object'
}

export function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]'
}
export function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}
