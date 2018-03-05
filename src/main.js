import Observer from './observer/index'
import Frankxx from './instance'

const v = new Frankxx({
  data: {
    a: 1,
    b: {
      c: 3
    }
  }
})

// v.$watch('a', () => console.log('a改变了'))
// v.$watch('b.c', () => console.log('c 改变了'))
setTimeout(() => {
  v.a = 4
}, 1000)

setTimeout(() => {
  v.a = 5
}, 2000)
