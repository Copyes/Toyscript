export default class Frankxx {
  constructor(options) {
    this.$data = options.data
    this.$el = options.el
    this.$tpl = options.template
    this._render(this.$tpl, this.$data)
  }
  $setData(dataObj, cb) {
    let self = this
    let once = false
    let observeData = new Proxy(dataObj, {
      set(target, property, value) {
        if (!once) {
          target[property] = value
          once = true
          self._render(self.$tpl, self.$data)
        }
        return true
      }
    })
    cb(observeData)
  }
  _render(tplStr, data) {
    document.querySelector(this.$el).innerHTML = this._replaceFun(tplStr, data)
  }
  _replaceFun(str, data) {
    return str.replace(/\{\{([^{}]*)\}\}/g, (a, b) => {
      let r = this._getObjProp(data, b)
      console.log(a, b, r)
      if (typeof r === 'string' || typeof r === 'number') {
        return r
      } else {
        return this._getObjProp(r, b.split('.')[1])
      }
    })
  }
  _getObjProp(obj, propName) {
    console.log(propName)
    let propsArr = propName.split('.')
    function rec(o, pName) {
      if (!o[pName] instanceof Array && o[pName] instanceof Object) {
        return rec(o[pName], propsArr.shift())
      }
      return o[pName]
    }
    return rec(obj, propsArr.shift())
  }
}
