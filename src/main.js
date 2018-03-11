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

setTimeout(() => {
  v.a = 4
}, 1000)

v.$watch('a', () => console.log('a改变了'))
