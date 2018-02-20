import Frankxx from './frankxx/frankxx'

let template = document.querySelector('#app').innerHTML

let frankxx = new Frankxx({
  template,
  el: '#app',
  data: {
    name: 'frankxx',
    lang: 'javascript',
    work: 'data binding',
    supports: ['String', 'Array', 'Object'],
    info: {
      author: 'lip.fan',
      jsVersion: 'ECMA2015'
    },
    motto: 'Every dog has his day'
  }
})

document.querySelector('#set-motto').oninput = e => {
  frankxx.$setData(frankxx.$data, $d => {
    $d.motto = e.target.value
  })
}
