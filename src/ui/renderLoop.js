import { Gameboard } from '@/classes/Gameboard'

let isPaused = false
let prevTime = 0
let secondCounter = 0
export function renderLoop (frameTime) {
  if (isPaused) return
  const delta = frameTime - prevTime

  renderLoop.render.forEach(elem => {
    if (typeof elem.render === 'function') elem.render(delta)
  })

  secondCounter += delta
  if (Math.floor(secondCounter / 1000) >= 1) {
    secondCounter = 0
    renderLoop.render.forEach(elem => {
      if (typeof elem.everySecond === 'function') elem.everySecond(delta)
    })
  }
  prevTime = frameTime
  window.requestAnimationFrame(renderLoop)
}

renderLoop.start = () => {
  isPaused = false
  window.requestAnimationFrame(renderLoop)
}

renderLoop.stop = () => {
  isPaused = true
}

renderLoop.render = []
renderLoop.addRender = (elem) => {
  renderLoop.render.push(elem)
}
