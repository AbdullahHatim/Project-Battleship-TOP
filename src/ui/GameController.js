import { Gameboard } from '@/classes/Gameboard'
import { Player } from '@/classes/Player'
import { Ship } from '@/classes/Ship'
import { getBoardHTML } from './components/board'
import { renderLoop } from './renderLoop'
import './game.css'

const content = document.querySelector('#content')
const stageContent = document.createElement('div')
stageContent.id = 'stage-content'
content.append(stageContent)

const prependLettersNumbers = (elem) => {
  const letters = document.createElement('div')
  letters.className = 'letters'
  const numbers = document.createElement('div')
  numbers.className = 'numbers'

  let lettersHTML = ''
  let numbersHTML = ''

  for (let i = 0; i < 10; i++) {
    const char = String.fromCharCode(65 + i)
    lettersHTML += `<p>${char}</p>`
  }
  for (let k = 1; k <= 10; k++) {
    numbersHTML += `<p>${k}</p>`
  }
  letters.innerHTML = lettersHTML
  numbers.innerHTML = numbersHTML
  elem.prepend(letters, numbers)
}

function gameController () {
  const players = [new Player('player1'), new Player('computer', true)]
  let currentPlayer = players[0]
  let otherPlayer = players[1]

  const switchPlayer = () => {
    [currentPlayer, otherPlayer] = [otherPlayer, currentPlayer]
  }

  const setStage = (stage) => {
    stageContent.innerHTML = ''
    stageContent.appendChild(stage)
  }

  const stage2 = document.createElement('div')
  stage2.dataset.stage = '1'
  stage2.className = 'stage'

  setStage(stage2)
  const html = `
  <div class="boards">
    <div class="board-container">
      ${getBoardHTML(currentPlayer.gameboard.board)}
    </div>
    <div class="board-container">
      ${getBoardHTML(otherPlayer.gameboard.attacks)}
    </div>
  </div>`

  stage2.innerHTML = html
  const boardContainers = stage2.querySelectorAll('.board-container')
  for (const container of boardContainers) {
    prependLettersNumbers(container)
  }
  const renderObj = {}
  renderObj.render = () => {
  }

  // let i = 1
  // renderObj.everySecond = () => {
  //   stage1.dataset.stage = ((i++) % 2) + 1
  // }

  // renderLoop.addRender(renderObj)
  // renderLoop.start()
}

export { gameController }
