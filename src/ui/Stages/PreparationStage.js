import { switchPlayer, currentPlayer, otherPlayer, winner, prependLettersNumbers, stageContent } from '../gameController'
import { getBoardDiv } from '../components/board'
import * as Anim from '@/ui/components/animations'
import { Stage } from '../components/Stage'
import { Ship } from '@/classes/Ship'
import { Gameboard } from '@/classes/Gameboard'

export function PreparationStage () {
  const stage = document.createElement('div')
  // stageContent.style.backgroundColor = 'teal'
  stage.dataset.stage = 'preparation'
  stage.className = 'stage'
  const html = /* js */`
  <div class="boards">
    <div class="board-container player" data-name="${currentPlayer.name}">
      <div class="tag"></div>
    </div>
    <div class="second-column">
      <div class="board-container ships" data-name="Ships">
        <div class="tag"></div>
      </div>
      <div class="button-container"><button class="confirm">Confirm</button></div>
    </div>
  </div>`

  stage.innerHTML = html
  let currentDrag
  let isDragging = false
  function createElementFromHTML (htmlString) {
    const div = document.createElement('div')
    div.innerHTML = htmlString.trim()

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild
  }
  const playerShips = new Map()
  const ships = [
    '<div class="draggable-ship" data-rotation="0" data-length="5" data-index="0"></div>',
    '<div class="draggable-ship" data-rotation="0" data-length="4" data-index="1"></div>',
    '<div class="draggable-ship" data-rotation="0" data-length="3" data-index="2"></div>',
    '<div class="draggable-ship" data-rotation="0" data-length="3" data-index="3"></div>',
    '<div class="draggable-ship" data-rotation="0" data-length="2" data-index="4"></div>'
  ]
    .map(html => createElementFromHTML(html))
  // If every ship is null confirm button should finishup this stage
  const confirmButton = stage.querySelector('button.confirm')
  confirmButton.onclick = () => { if (ships.every(ship => ship === null)) { finishUp() } else { shakeShipsDiv() } }
  const boardContainers = stage.querySelectorAll('.board-container')

  function moveShipFromShipDivToPlayerDiv (currship, cell) {
    const shipIndex = currship.dataset.index
    playerShips.set(cell.dataset.coord, ships[shipIndex])
    ships[shipIndex] = null
  }
  function addCoordsToCurrentDrag (coordsArr, currentDrag) {
    currentDrag.dataset.coordsArr = coordsArr.join()
  }
  function appendShips (cells) {
    cells.forEach(cell => {
      const coord = cell.dataset.coord
      const ship = playerShips.get(coord)
      if (ship) { ship.dataset.holding = 'false'; cell.append(ship) }
    })
  }
  function appendShipToCell (ship, cell) {
    console.log(cell)
    console.log(ship)
    cell.append(ship)
  }
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

    for (let i = 0; i < 5; i++) { if (ships[i]) ERank[i].append(ships[i]) }

    return div
  }
  // TODO: a simple idea, when i hold the ship it gets added back into ships[],
  // TODO: if it was taken from PlayersDiv then also remove the ship from tempBoard
  function resetShip (ship) {
    const playerDiv = document.querySelector('.player')
    if (!playerDiv.contains(ship)) return // obviously
    // TODO: 1- remove it from The Player's Board & its Entry on playerShips Map
    const parentCell = ship.parentElement
    // FIX: Ship on the player's DIV Doesn't update .draggable-ship position if it had its position Re-changed
    playerShips.delete(parentCell.dataset.coord)
    ship.remove()
    const coordsArr = (ship.dataset.coordsArr).split(',')
    // ship.dataset.coordsArr = ''
    // TODO: 2- remove it from tempBoard
    for (const coord of coordsArr) {
      tempBoard.board.set(coord, null)
      // TODO: 3- Change player's board cells.dataset.value to be oldShip (used in css)
      const cell = playerDiv.querySelector(`[data-coord="${coord}"]`)
      cell.dataset.value = 'null'
    }
    // TODO: 4- Add The ship back to ships[] using its ship.dataset.index
    const index = ship.dataset.index
    ships[index] = ship
    // TODO: 5- Trigger a shipsDivUpdate
    updateShipsDiv()
  }
  let validShips
  const hold = function (e) {
    this.dataset.holding = 'true'
    currentDrag = this
    // TODO: Check IF the parent of currentDrag is cell in div.player, If so remove it from that cell, then
    // TODO: also remove it from temp board, and set all the cells.dataset.value = "null
    resetShip(currentDrag)
    isDragging = true
  }
  const rotate = (e) => {
    if (e.code !== 'KeyR') return
    if (!isDragging) return
    const currentRotation = currentDrag.dataset.rotation * 1 ? 0 : 1
    currentDrag.dataset.rotation = `${currentRotation}`
  }

  const getValidShips = (ships) => {
    const validShips = ships.filter(ship => ship)
    return validShips
  }
  const moveHandler = (e) => {
    validShips.forEach((ship) => {
      ship.dataset.x = e.pageX
      ship.dataset.y = e.pageY
    })
  }
  const upHandler = (e) => {
    validShips.forEach((ship) => {
      ship.dataset.holding = 'false'
    })
    isDragging = false
    // if (currentDrag) { currentDrag.dataset.rotation = '0' } // this was the workaround to reset rotation on Ships Div so they always appear up right
  }

  function addEventListeners () {
    validShips = getValidShips(ships)
    validShips.forEach((ship) => {
      ship.addEventListener('mousedown', hold)
    })
    document.addEventListener('keypress', rotate)
    document.addEventListener('mousemove', moveHandler)
    document.addEventListener('mouseup', upHandler)
  }
  function removeEventListeners () {
    document.removeEventListener('keypress', rotate)
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', upHandler)
  }
  function updateShipsDiv () {
    boardContainers[1].innerHTML = ''
    boardContainers[1].append(createElementFromHTML('<div class="tag"></div>'))
    boardContainers[1].append(getShipsDiv())
    validShips.forEach((ship) => {
      ship.removeEventListener('mousedown', hold)
    })
    removeEventListeners()
    addEventListeners()
  }
  // temp board to place ships in
  const tempBoard = new Gameboard()

  // false or new ship coordinates
  let successfulPlacement = false
  const padding = 1
  // const ships = new Map()
  function getAdjacentCells (cell, playerDiv) {
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
  const skins = `

Available Skins:
galaxy    cat     cat2      randomcat   neoncat   rubik   ???
rainbow   red     blue      green       yellow    white   black   purple
troll     troll2  glitter   glitter2    car       car2    car3    ali
  `
  function updateBoards () {
    boardContainers[0].innerHTML = ''
    prependLettersNumbers(boardContainers[0])
    prependLettersNumbers(boardContainers[1], 5, 5)
    const renameButton = createElementFromHTML('<button class="tag"></button>')
    boardContainers[0].append(renameButton)
    renameButton.onclick = () => { const playerName = window.prompt(`Enter New Name\nTo get Skin add [skin name] to your name (do not combine skins)\nexample: galaxy ali\nexample: bob galaxy${skins}`); if (playerName) { currentPlayer.name = playerName; boardContainers[0].dataset.name = playerName } }

    const playerDiv = getBoardDiv(tempBoard.board)
    const cells = playerDiv.querySelectorAll('.board-cell')
    appendShips(cells)

    // this is the function that will
    // 1- check if we are currently dragging a ship if so
    // 2- get all of the above coords since we always drag the ship from the bottom
    // 3- if all the coords are of the same length of the dragged ship, then we can place
    // 4- set the data-hovered and --hover-color and successfulPlacement to array of coords
    // ? also sets the coords that we just got to the .draggable-ship to ease removal on temp-board
    function prepareShipPlacementInPlayerDiv (e) {
      successfulPlacement = false
      cells.forEach(cell => cell.dataset.hovered = 'false')
      cells.forEach(cell => cell.dataset.padding = 'false')
      if (!isDragging) return
      const coord = this.dataset.coord
      const shipLength = currentDrag.dataset.length
      const rotation = currentDrag.dataset.rotation * 1
      const coordCharCode = coord.charCodeAt(0)
      const hoveredCells = []
      const paddingCells = []

      if (!rotation) {
        for (let i = 0; i < shipLength; i++) {
          const char = String.fromCharCode(coordCharCode - i)
          const currentHoveredCell = playerDiv.querySelector(`[data-coord="${coord.replace(coord[0], char)}"]`)
          if (currentHoveredCell) {
            paddingCells.push(...getAdjacentCells(currentHoveredCell, playerDiv))
            hoveredCells.push(
              currentHoveredCell
            )
          }
        }
      } else {
        for (let i = 0; i < shipLength; i++) {
          const number = (coord.slice(1) * 1) - i
          const currentHoveredCell = playerDiv.querySelector(`[data-coord="${coord[0]}${number}"]`)
          if (currentHoveredCell) {
            paddingCells.push(...getAdjacentCells(currentHoveredCell, playerDiv))
            hoveredCells.push(
              currentHoveredCell
            )
          }
        }
      }
      hoveredCells.forEach(cell => cell.dataset.hovered = 'true')
      if (hoveredCells.length >= shipLength && paddingCells.every(cell => cell.dataset.value !== 'ship')) {
        successfulPlacement = [...hoveredCells.map(cell => cell.dataset.coord)]
        document.documentElement.style.setProperty('--hover-color', 'var(--hover-valid)')
      } else {
        successfulPlacement = false
        document.documentElement.style.setProperty('--hover-color', 'var(--hover-error)')
      }
    }

    for (const cell of cells) {
      cell.addEventListener('mousemove', prepareShipPlacementInPlayerDiv)

      // ? so the hover is cleared after the ship left the playerDiv
      cell.addEventListener('mouseleave', () => {
        cells.forEach(cell => cell.dataset.hovered = 'false')
        cells.forEach(cell => cell.dataset.padding = 'false')
      })

      // ? so the Ship hover updates when .draggable-ship is rotates
      cell.tabIndex = -1
      cell.addEventListener('mouseenter', () => { cell.focus() })
      cell.addEventListener('keyup', prepareShipPlacementInPlayerDiv)
      // this will only execute if we actually got some valid coords to work with, then update the tempBoard div (PlayerDiv)
      cell.addEventListener('mouseup', function () { if (successfulPlacement) { tempBoard.placeShip(...successfulPlacement); moveShipFromShipDivToPlayerDiv(currentDrag, this); addCoordsToCurrentDrag(successfulPlacement, currentDrag); update() } })
    }

    boardContainers[0].append(playerDiv)
  }
  async function shakeShipsDiv () {
    const shipsDiv = stage.querySelector('.ships')
    shipsDiv.style.animation = 'headShake 1000ms paused'
    await Anim.onAnimation(shipsDiv)
    shipsDiv.style.animation = ''
  }
  async function update () {
    updateBoards()
    addEventListeners()
    updateShipsDiv()
  }
  async function ready () {
    const boards = stage.querySelector('.boards')
    boards.style.animation = 'fadeInUpBig 1000ms forwards paused'
    Anim.startAnimation(boards)
    await Anim.onAnimationEnd(boards)
  }
  async function done () {
    currentPlayer.gameboard.board = new Map(tempBoard.board)

    await Anim.wait(200)
    const boards = stage.querySelector('.boards')
    boards.style.animation = 'fadeOutDownBig 1000ms forwards paused'
    Anim.startAnimation(boards)
    await Anim.onAnimationEnd(boards)
  }
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

  return Object.assign(new Stage(), { name: 'prepare', stage, update, ready, done, isDone, finishUp, doneButton })
}
