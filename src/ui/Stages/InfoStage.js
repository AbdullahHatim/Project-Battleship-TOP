import { switchPlayer, currentPlayer, otherPlayer, winner, prependLettersNumbers } from '../gameController'
import { getBoardDiv } from '../components/board'
import * as Anim from '@/ui/components/animations'
import { Stage } from '../components/Stage'

export function InfoStage () {
  const stage = document.createElement('div')
  stage.dataset.stage = 'info'
  stage.className = 'stage'
  stage.dataset.name = winner.name
  stage.innerHTML = `
  <div class="card">
    <h1>Winner🏆</h1>
    <h1>${winner.name}</h1>
  </div>
  `
  const div = stage.querySelector('div')
  div.style.animation = 'slideInUp 1400ms ease-out paused'
  async function ready () {
    await Anim.onAnimation(div)

    await Anim.wait(1000)
    const restart = document.createElement('h3')
    restart.textContent = 'Refresh the page to restart'
    restart.style.animation = 'fadeIn 1400ms ease-out paused'
    div.append(restart)
    await Anim.onAnimation(restart)
  }
  async function update () {}
  async function done () {}
  const doneButton = document.createElement('button')
  function finishUp () {
    doneButton.click()
  }
  function isDone () {
    return new Promise(resolve => {
      doneButton.onclick = resolve
    })
  }
  return Object.assign(new Stage(), { name: 'info', stage, update, ready, done, isDone, finishUp, doneButton })
}
