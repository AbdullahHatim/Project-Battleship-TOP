import { switchPlayer, currentPlayer, otherPlayer, winner, prependLettersNumbers, setSecondPlayer, stageContent } from '../gameController'
import { getBoardDiv } from '../components/board'
import * as Anim from '@/ui/components/animations'
import { Stage } from '../components/Stage'

export function SetSecondPlayerStage () {
  const stage = document.createElement('div')
  // stageContent.style.backgroundColor = ''
  stage.dataset.stage = 'secondPlayer'
  stage.className = 'stage'
  stage.innerHTML = `
  <div class="select">
    <p class="title"></p>
    <button class="setPlayer">Player</button>
    <button class="setComputer">Computer</button>
  </div>
  `
  const title = stage.querySelector('.title')
  title.textContent = 'Choose Player 2'

  const stageObj = new Stage()

  stageObj.name = ''// used as communication between this stage and the preparation stage
  const setPlayerButton = stage.querySelector('.setPlayer')
  const setComputerButton = stage.querySelector('.setComputer')
  // function setComputerShips () {
  //   // remove these comments after you are done
  //   // this function should place 5 ships randomly in a grid
  //   // the 5 ships lengths are respectively 5, 4, 3, 3, 2
  //   // each ship cannot be adjacent to each other
  //   // legal placements are from A1 to J10 only
  //   // ships can be placed horizontally or vertically

  //   // you will place the computer ships using otherPlayer.gameboard.placeship() function
  //   /// an example of this is (length of 2 ship)
  //   otherPlayer.gameboard.placeShip('A10', 'B10')
  //   // another example for the ship of length 5
  //   otherPlayer.gameboard.placeShip('J10', 'J9', 'J8', 'J7', 'J6')

  //   // ships cannot be discrete and should not overwrite each other
  // }

  setComputerButton.addEventListener('click', () => {
    if (!window.confirm('Set the Second Player to "Computer" ?')) return
    setSecondPlayer('computer', true)
    setComputerShips()
    stageObj.name = 'computer'
    finishUp()
  })

  setPlayerButton.addEventListener('click', () => {
    if (!window.confirm('Set the Second Player to "Player" ?')) return
    setSecondPlayer('Click To Rename')
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

function setComputerShips () {
  const shipLengths = [5, 4, 3, 3, 2]
  const gridSize = 10 // For a 10x10 grid (A1 to J10)

  // placementGrid: 0 = empty, 1 = ship, 2 = buffer zone (adjacent to ship)
  const placementGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0))

  // Helper function to convert "A1" style coordinates to {row, col} numeric
  function toGridCoords (cellStr) {
    const col = cellStr.charCodeAt(0) - 'A'.charCodeAt(0)
    const row = parseInt(cellStr.substring(1)) - 1
    if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) {
      throw new Error(`Invalid coordinate string: ${cellStr}`)
    }
    return { row, col }
  }

  // Helper function to convert {row, col} numeric to "A1" style coordinates
  function toCellStr (row, col) {
    if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) {
      throw new Error(`Invalid numeric coordinate: row ${row}, col ${col}`)
    }
    const char = String.fromCharCode('A'.charCodeAt(0) + col)
    const num = row + 1
    return char + num
  }

  for (const length of shipLengths) {
    let placed = false
    // Keep trying to place the current ship until a valid spot is found
    while (!placed) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical'
      const startRow = Math.floor(Math.random() * gridSize)
      const startCol = Math.floor(Math.random() * gridSize)

      const potentialShipCells = [] // Stores {row, col} objects for the current attempt
      let possibleToPlace = true

      // Generate coordinates for the potential ship
      if (orientation === 'horizontal') {
        if (startCol + length > gridSize) { // Check boundary
          possibleToPlace = false
        } else {
          for (let i = 0; i < length; i++) {
            potentialShipCells.push({ row: startRow, col: startCol + i })
          }
        }
      } else { // Vertical
        if (startRow + length > gridSize) { // Check boundary
          possibleToPlace = false
        } else {
          for (let i = 0; i < length; i++) {
            potentialShipCells.push({ row: startRow + i, col: startCol })
          }
        }
      }

      if (!possibleToPlace) {
        continue // Try a new random placement
      }

      // Check for collision with existing ships or their buffer zones
      let canPlaceThisShip = true
      for (const cell of potentialShipCells) {
        // Ensure cell is within grid (already done by startCol/startRow + length checks, but good for safety)
        // And check if the cell is already occupied by a ship (1) or its buffer zone (2)
        if (cell.row < 0 || cell.row >= gridSize || cell.col < 0 || cell.col >= gridSize || placementGrid[cell.row][cell.col] !== 0) {
          canPlaceThisShip = false
          break
        }
      }

      if (canPlaceThisShip) {
        const shipCellStrings = [] // Stores "A1" style strings for placeShip()

        // Place the ship and mark grid
        for (const cell of potentialShipCells) {
          placementGrid[cell.row][cell.col] = 1 // Mark as ship
          shipCellStrings.push(toCellStr(cell.row, cell.col))
        }

        // Mark buffer zones around the newly placed ship
        // This includes cells diagonally adjacent
        for (const cell of potentialShipCells) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const r = cell.row + dr
              const c = cell.col + dc

              if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                // If the cell (r,c) is currently empty (0), mark it as buffer (2)
                if (placementGrid[r][c] === 0) {
                  placementGrid[r][c] = 2
                }
              }
            }
          }
        }

        // Call the gameboard function to actually place the ship
        otherPlayer.gameboard.placeShip(...shipCellStrings)
        placed = true // Move to the next ship
      }
      // If !canPlaceThisShip, the while loop continues for a new attempt for this ship.
    }
  }
}
