import { Player } from '@/classes/Player'
import * as Anim from './components/animations'
import 'animate.css'
import './game.css'
import './animation.css'
import { Stage } from './components/Stage'
import { PreparationStage } from './Stages/PreparationStage'
import { MainStage } from './Stages/MainStage'
import { InfoStage } from './Stages/InfoStage'

const content = document.querySelector('#content')
export const stageContent = document.createElement('div')
stageContent.id = 'stage-content'
content.append(stageContent)

export const prependLettersNumbers = (elem, nums = 10, chars = 10) => {
  const letters = document.createElement('div')
  letters.className = 'letters'
  const numbers = document.createElement('div')
  numbers.className = 'numbers'

  let lettersHTML = ''
  let numbersHTML = ''

  for (let i = 0; i < chars; i++) {
    const char = String.fromCharCode(65 + i)
    lettersHTML += `<p>${char}</p>`
  }
  for (let k = 1; k <= nums; k++) {
    numbersHTML += `<p>${k}</p>`
  }
  // ? messed up the order, easiest fix is to just swap the two
  letters.innerHTML = numbersHTML
  numbers.innerHTML = lettersHTML
  elem.prepend(letters, numbers)
}
export const players = [new Player('player1'), new Player('computer', true)]
export let currentPlayer = players[0]
export let otherPlayer = players[1]
export let winner
export const setWinner = (p) => { winner = p }

export const resetPlayers = () => {
  players.length = 0
  players.push(new Player('player1'))
  players.push(new Player('computer', true))
  currentPlayer = players[0]
  otherPlayer = players[1]
}

export const switchPlayer = () => {
  [currentPlayer, otherPlayer] = [otherPlayer, currentPlayer]
}
// where all the magic happens (connects everything together, DOM, Players, and Game flow/ Animations)
function gameController () {
  currentPlayer.gameboard.placeShip('A1', 'A2')
  currentPlayer.gameboard.placeShip('B5', 'C5', 'D5', 'E5', 'F5')
  currentPlayer.gameboard.placeShip('J10')
  otherPlayer.gameboard.placeShip('A10', 'B10')

  // TODO: Add Flow Control function so That stages don't know about each other
  // * Each stage when they are done just release a isDone signal witch we wait for

  async function setStage (stage) {
    Stage.validateProperties(stage)
    stageContent.innerHTML = ''
    stageContent.appendChild(stage.stage)
    await stage.ready()
    await stage.isDone()
    await stage.done()
  }
  async function gameFlow () {
    await setStage(PreparationStage())
    await setStage(MainStage())
    await setStage(InfoStage())
  }
  gameFlow()

  // (async () => { await new Promise(r => setTimeout(r, 2000)); setStage(InfoStage); console.log('done') })()
  function refreshStage () {
    currentStage.update()
  }
}

export { gameController }
