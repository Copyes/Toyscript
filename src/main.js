import Observer from './observer/index'
import Vue from './instance'

const v = new Vue({
  data: {
    a: 1,
    b: {
      c: 3
    }
  }
})

v.$watch('a', () => console.log('哈哈'))

setTimeout(() => {
  v.a = 4
}, 1000)

setTimeout(() => {
  v.a = 5
}, 2000)

console.log(v._data)
