import { switchPlayer, currentPlayer, otherPlayer, winner, prependLettersNumbers } from '../gameController'
import { getBoardDiv } from '../components/board'
import * as Anim from '@/ui/components/animations'
import { Stage } from '../components/Stage'
import { Ship } from '@/classes/Ship'

export function PreparationStage () {
  const stage = document.createElement('div')
  stage.dataset.stage = 'preparation'
  stage.className = 'stage'
  const html = /* js */`
  <div class="boards">
    <div class="board-container player" data-name="${currentPlayer.name}">
    </div>
    <div class="board-container ships" data-name="${currentPlayer.name}">
    </div>
  </div>`

  stage.innerHTML = html
  const boardContainers = stage.querySelectorAll('.board-container')
  function getShipsDiv () {
    const div = document.createElement('div')
    div.className = 'board ships'

    let html = ''
    for (let i = 0; i < 5; i++) {
      const char = String.fromCharCode(65 + i)
      for (let k = 1; k <= 5; k++) {
        html += `<div class="board-cell" data-coord="${char}${k}" data-value="null"></div>`
      }
    }
    div.innerHTML = html

    const ships = div.querySelectorAll('[data-coord^="E"]')
    div.addEventListener('click', (e) => {
      console.log(e.target)
    })
    const ship1 = document.createElement('div')
    ship1.addEventListener('click', (e) => {
      console.log(e.target)
    })
    // ships[0].addEventListener('click', (e) => {
    //   console.log(e.target)
    // })
    ship1.className = 'draggable-ship'
    ship1.dataset.length = 5
    ships[0].append(ship1)
    return [div]
  }

  // const ships = new Map()
  function updateBoards () {
    for (const container of boardContainers) {
      container.innerHTML = ''
    }
    prependLettersNumbers(boardContainers[0])
    prependLettersNumbers(boardContainers[1], 5, 5)
    boardContainers[0].append(getBoardDiv(currentPlayer.gameboard.board))
    boardContainers[1].append(...getShipsDiv())
  }

  async function update () {
    updateBoards()
  }
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

  update()

  return Object.assign(new Stage(), { name: 'info', stage, update, ready, done, isDone, finishUp, doneButton })
}
