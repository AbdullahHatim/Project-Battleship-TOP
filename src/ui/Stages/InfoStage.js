import { switchPlayer, currentPlayer, otherPlayer, winner, prependLettersNumbers } from '../gameController'
import { getBoardDiv } from '../components/board'
import * as Anim from '@/ui/components/animations'
import { Stage } from '../components/Stage'

export function InfoStage () {
  const stage = document.createElement('div')
  stage.dataset.stage = 'info'
  stage.className = 'stage'
  stage.innerHTML = `<h1>${winner.name}</h1>`
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
