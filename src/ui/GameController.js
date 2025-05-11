import { Gameboard } from '@/classes/Gameboard'
import { Player } from '@/classes/Player'
import { Ship } from '@/classes/Ship'
import { getBoardHTML, getBoardDiv } from './components/board'
import * as Anim from './components/animations'
import 'animate.css'
import './game.css'
import './animation.css'

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
  // ? messed up the order, easiest fix is to just swap the two
  letters.innerHTML = numbersHTML
  numbers.innerHTML = lettersHTML
  elem.prepend(letters, numbers)
}

function gameController () {
  const players = [new Player('player1'), new Player('computer', true)]
  let currentPlayer = players[0]
  let otherPlayer = players[1]

  currentPlayer.gameboard.placeShip('A1', 'A2')
  otherPlayer.gameboard.placeShip('A10', 'B10')

  const resetPlayers = () => {
    players.length = 0
    players.push(new Player('player1'))
    players.push(new Player('computer', true))
    currentPlayer = players[0]
    otherPlayer = players[1]
  }

  const switchPlayer = () => {
    [currentPlayer, otherPlayer] = [otherPlayer, currentPlayer]
  }

  function getStage2 () {
    const stage2 = document.createElement('div')
    stage2.dataset.stage = '2'
    stage2.className = 'stage'

    const html = /* js */`
    <div class="boards">
      <div class="board-container">
        ${getBoardHTML(currentPlayer.gameboard.board)}
      </div>
      <div class="board-container attacks">
        ${getBoardHTML(otherPlayer.gameboard.attacks, true)}
      </div>
    </div>`

    stage2.innerHTML = html
    const boardContainers = stage2.querySelectorAll('.board-container')

    let isUpdating = false
    async function makeComputerMove () {
      // currentPlayer.gameboard.receiveAttack('A1')
    }

    function updateBoards () {
      for (const container of boardContainers) {
        container.innerHTML = ''
        prependLettersNumbers(container)
      }
      boardContainers[0].append(getBoardDiv(currentPlayer.gameboard.board))
      boardContainers[1].append(getBoardDiv(otherPlayer.gameboard.attacks, true))
    }
    // main update loop (event-based)
    async function update (e) {
      if (!e.target.classList.contains('board-cell')) return
      if (isUpdating) return
      isUpdating = true

      const cell = e.target
      if (cell.classList.contains('board-cell')) {
        cell.style.animationName = 'bounceIn'
        cell.style.animationDuration = '200ms'
        cell.style.animationState = 'paused'
        await Anim.onAnimation(stage2)
        otherPlayer.gameboard.receiveAttack(cell.dataset.coord)
      }

      // await new Promise((r) => setTimeout(r, 1000))
      if (otherPlayer.isComputer) {
        await makeComputerMove()
      } else {
        switchPlayer()
      }

      updateBoards()
      isUpdating = false
    }

    for (const container of boardContainers) {
      container.addEventListener('click', update)
    }
    updateBoards()
    return { stage: stage2, update }
  }
  let currentStage = getStage2()
  const setStage = (stageCB) => {
    currentStage = stageCB()
    stageContent.innerHTML = ''
    stageContent.appendChild(currentStage.stage)
  }
  setStage(getStage2)
  function refreshStage () {
    currentStage.update()
  }

  // Object.assign(gameController, { players, resetPlayers, switchPlayer, refreshStage })
}

export { gameController }
