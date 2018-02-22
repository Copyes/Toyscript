import Dep, { pushTarget, popTarget } from './dep'
import { parsePath } from './utils'

let uid = 0
export default class Watcher {
  constructor(vm, expOrFn, cb, options) {
    this.vm = vm
    // vm._watchers.push(this)
    this.cb = cb
    this.id = uid++
    this.expression = ''
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()

    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = function() {}
        console.log('getter error')
      }
    }
    this.value = this.get()
  }
  get() {
    pushTarget(this)
    let value
    const vm = this.vm

    value = this.getter.call(vm, vm)
    popTarget()
    // this.cleanupDeps()
    return value
  }
  addDep(dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }
  cleanupDeps() {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }
  update() {
    this.run()
  }
  run() {
    const value = this.get()
    if (value !== this.value) {
      this.value = value
      this.cb.call(this.vm)
    }
  }
}
