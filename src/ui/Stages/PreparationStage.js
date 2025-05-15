import { switchPlayer, currentPlayer, otherPlayer, winner, prependLettersNumbers } from '../gameController'
import { getBoardDiv } from '../components/board'
import * as Anim from '@/ui/components/animations'
import { Stage } from '../components/Stage'
import { Ship } from '@/classes/Ship'
import { Gameboard } from '@/classes/Gameboard'

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
  let currentDrag
  let isDragging = false
  const boardContainers = stage.querySelectorAll('.board-container')
  boardContainers[1].append(getShipsDiv())
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

    const ERank = div.querySelectorAll('[data-coord^="E"]')

    const ship1 = document.createElement('div')

    ship1.className = 'draggable-ship'
    ship1.dataset.length = 5
    ERank[0].append(ship1)

    const ships = [ship1]
    // this is the Drag and Drop core mechanic
    function hold () {
      this.dataset.holding = 'true'
      currentDrag = this
      isDragging = true
    }
    ships.forEach((ship) => {
      ship.addEventListener('mousedown', hold)
    })
    document.addEventListener('mousemove', (e) => {
      ships.forEach((ship) => {
        ship.dataset.x = e.pageX
        ship.dataset.y = e.pageY
      })
    })
    document.addEventListener('mouseup', function () {
      ships.forEach((ship) => {
        ship.dataset.holding = 'false'
      })
      isDragging = false
    })
    return div
  }
  // temp board to place ships in
  const tempBoard = new Gameboard()
  window.tempBoard = tempBoard

  // false or new ship coordinates
  let successfulPlacement = false
  const padding = 1
  // const ships = new Map()
  function updateBoards () {
    boardContainers[0].innerHTML = ''
    prependLettersNumbers(boardContainers[0])
    prependLettersNumbers(boardContainers[1], 5, 5)

    const playerDiv = getBoardDiv(tempBoard.board)
    const cells = playerDiv.querySelectorAll('.board-cell')

    function getAdjacentCells (cell) {
      const adjacentCells = []
      // get all 8 padding cells
      const coord = cell.dataset.coord
      for (let rank = -1; rank < 2; rank++) {
        const char = String.fromCharCode(coord.charCodeAt(0) - rank)
        // const currentRank = (coord.replace(coord[0], char))[0]
        for (let file = -1; file < 2; file++) {
          const currentFile = coord.slice(1) * 1
          const currentPaddingCell = playerDiv.querySelector(`[data-coord="${char}${currentFile - file}"]`)
          if (
            currentPaddingCell &&
            !(adjacentCells.includes(currentPaddingCell))
          ) { adjacentCells.push(currentPaddingCell) }
        }
      }
      adjacentCells.forEach(cell => {
        if (cell.dataset.value !== 'ship') cell.dataset.padding = 'true'
      })
      // adjacentCells.forEach(cell => cell.style.backgroundColor = 'red')
      return adjacentCells
    }

    // this is the function that will
    // 1- check if we are currently dragging a ship if so
    // 2- get all of the above coords since we always drag the ship from the bottom
    // 3- if all the coords are of the same length of the dragged ship, then we can place
    // 4- set the data-hovered and --hover-color and successfulPlacement to array of coords
    function placeShip (e) {
      successfulPlacement = false
      cells.forEach(cell => cell.dataset.hovered = 'false')
      cells.forEach(cell => cell.dataset.padding = 'false')
      if (!isDragging) return
      const coord = this.dataset.coord
      const shipLength = currentDrag.dataset.length
      const coordCharCode = coord.charCodeAt(0)
      const hoveredCells = []
      const paddingCells = []
      for (let i = 0; i < 5; i++) {
        const char = String.fromCharCode(coordCharCode - i)
        const currentHoveredCell = playerDiv.querySelector(`[data-coord="${coord.replace(coord[0], char)}"]`)
        if (currentHoveredCell) {
          paddingCells.push(...getAdjacentCells(currentHoveredCell))
          hoveredCells.push(
            currentHoveredCell
          )
        }
      }
      hoveredCells.forEach(cell => cell.dataset.hovered = 'true')
      if (hoveredCells.length >= shipLength && paddingCells.every(cell => cell.dataset.value !== 'ship')) {
        successfulPlacement = [...hoveredCells.map(cell => cell.dataset.coord)]
        document.documentElement.style.setProperty('--hover-color', 'var(--hover-valid)')
        // currentDrag.remove()
      } else {
        successfulPlacement = false
        document.documentElement.style.setProperty('--hover-color', 'var(--hover-error)')
      }
    }

    for (const cell of cells) {
      cell.addEventListener('mousemove', placeShip)

      // this will only execute if we actually got some valid coords to work with, then update the tempBoard div (PlayerDiv)
      cell.addEventListener('mouseup', () => { if (successfulPlacement) { console.log(successfulPlacement); tempBoard.placeShip(...successfulPlacement); updateBoards() } })
    }
    // playerDiv.addEventListener('mouseenter', (e) => { console.log('mousemove', e.target) })
    boardContainers[0].append(playerDiv)
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
