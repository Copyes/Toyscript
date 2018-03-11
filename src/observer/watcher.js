import Dep, { pushTarget, popTarget } from './dep'
import { parsePath } from './utils'

let has = {}
let flushing = false
let index = 0
let waiting = false
let queue = []
function queueWatcher(watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true //防止数据乱变化,造成短时间多次更新
    if (!flushing) {
      queue.push(watcher)
    } else {
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}
const callbacks = []
let pending = false
function nextTick(cb, ctx) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {}
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    /*
		if (useMacroTask) {
			macroTimerFunc()
		} else {
			microTimerFunc()
		}
		*/
    // 简化版, 上面可以看出尤大对性能的追求,使用了宏任务与微任务,对性能的理解
    // flushCallbacks
    setTimeout(() => {
      pending = false
      const copies = callbacks.splice(0)
      callbacks.length = 0
      for (let i = 0; i < copies.length; i++) {
        copies[i]()
      }
    }, 0)
  }

  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
const activatedChildren = [] //子组件相关
function flushSchedulerQueue() {
  flushing = true
  let watcher, id
  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort((a, b) => a.id - b.id)

  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    id = watcher.id
    has[id] = null
    watcher.run()
    // 在线上版本中,为了防止意外出现循环更新,这里还需要做处理
  }

  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()

  resetSchedulerState()

  // 下面还会触发两个钩子,钩子省略,这两个钩子主要是在组件哪部进行通知或者更新的
  // 分别是激活组件钩子和更新组件钩子
  // todo
}

function resetSchedulerState() {
  index = queue.length = activatedChildren.length = 0
  has = {}
  waiting = flushing = false
}

function traverse() {}

let uid = 0
export default class Watcher {
  constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this
    }
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid
    this.active = true
    this.dirty = this.lazy
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepsIds = new Set()
    this.expression = expOrFn.toString()

    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      console.log(this.getter)
      if (!this.getter) {
        this.getter = function() {} // todo
      }
    }
    this.value = this.lazy ? undefined : this.get()
  }
  get() {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
      console.log(value)
    } catch (e) {
      console.log(e)
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    // value = this.getter.call(vm, vm)
    // popTarget()
    // this.cleanupDeps()
    return value
  }
  addDep(dep) {
    const id = dep.id
    if (!this.newDepsIds.has(id)) {
      this.newDepsIds.add(id)
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
      if (!this.newDepsIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    this.depIds = this.newDepsIds
    this.newDepsIds = tmp
    this.newDepsIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }
  update() {
    console.log('update')
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }
  run() {
    const value = this.get()
    if (value !== this.value) {
      const oldValue = this.value
      this.value = value
      this.cb.call(this.vm, value, oldValue)
    }
  }
  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
  teardown() {
    if (this.active) {
      if (!this.vm._isBeingDestoryed) {
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }
}
