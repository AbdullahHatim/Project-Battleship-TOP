import { switchPlayer, currentPlayer, otherPlayer, winner, prependLettersNumbers } from '../gameController'
import { getBoardDiv } from '../components/board'
import * as Anim from '@/ui/components/animations'
import { Stage } from '../components/Stage'

export function PreparationStage () {
  const stage = document.createElement('div')
  stage.dataset.stage = 'preparation'
  stage.className = 'stage'
  const html = /* js */`
  <div class="boards">
    <div class="board-container" data-name="${currentPlayer.name}">
    </div>
    <div class="board-container attacks" data-name="Attack ${otherPlayer.name}">
    </div>
  </div>`

  stage.innerHTML = html

  async function update () {}
  async function ready () {}
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
