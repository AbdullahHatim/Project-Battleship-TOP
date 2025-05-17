import { switchPlayer, currentPlayer, otherPlayer, winner, prependLettersNumbers, setSecondPlayer, stageContent } from '../gameController'
import { getBoardDiv } from '../components/board'
import * as Anim from '@/ui/components/animations'
import { Stage } from '../components/Stage'

export function SetSecondPlayerStage () {
  const stage = document.createElement('div')
  stageContent.style.backgroundColor = ''
  stage.dataset.stage = 'secondPlayer'
  stage.className = 'stage'
  stage.innerHTML = `
  <div class="select">
    <button class="setPlayer">Player</button>
    <button class="setComputer">Computer</button>
  </div>
  `
  const stageObj = new Stage()

  stageObj.name = ''// used as communication between this stage and the preparation stage
  const setPlayerButton = stage.querySelector('.setPlayer')
  const setComputerButton = stage.querySelector('.setComputer')
  function setComputerShips () {
    // TODO: Make WHOLE DAMN SYSTEM TO PLACE 5 SHIPS (of length 5, 4, 3, 3 and 2) RANDOMLY
    otherPlayer.gameboard.placeShip('A10', 'B10')
  }

  setComputerButton.addEventListener('click', () => {
    if (!window.confirm('Are You Sure you want to set the Second Player to "Computer" ?')) return
    setSecondPlayer('computer', true)
    setComputerShips()
    stageObj.name = 'computer'
    finishUp()
  })

  setPlayerButton.addEventListener('click', () => {
    const playerName = window.prompt('Enter Player Name')
    if (!playerName) return
    setSecondPlayer(playerName)
    stageObj.name = 'player'
    finishUp()
  })
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
  return Object.assign(stageObj, { /* name, */ stage, update, ready, done, isDone, finishUp, doneButton })
}
