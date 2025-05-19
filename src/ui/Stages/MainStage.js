import { switchPlayer, currentPlayer, otherPlayer, setWinner, prependLettersNumbers } from '../gameController'
import { getBoardDiv } from '../components/board'
import * as Anim from '@/ui/components/animations'
import { Stage } from '../components/Stage'

export function MainStage () {
  const stage = document.createElement('div')
  stage.dataset.stage = 'main'
  stage.className = 'stage'

  const html = /* js */`
  <div class="boards">
    <div class="board-container" data-name="${currentPlayer.name}">
    </div>
    <div class="board-container attacks" data-name="Attack ${otherPlayer.name}">
    </div>
  </div>`

  stage.innerHTML = html
  const boardContainers = stage.querySelectorAll('.board-container')

  let isUpdating = false

  function updateBoards () {
    for (const container of boardContainers) {
      container.innerHTML = ''
      prependLettersNumbers(container)
    }
    const currentPlayerAttackBoard = getBoardDiv(currentPlayer.gameboard.attacks)
    currentPlayerAttackBoard.classList.add('overlay')
    boardContainers[0].append(getBoardDiv(currentPlayer.gameboard.board), currentPlayerAttackBoard)
    boardContainers[0].dataset.name = currentPlayer.name
    boardContainers[1].append(getBoardDiv(otherPlayer.gameboard.attacks, true))
    boardContainers[1].dataset.name = otherPlayer.name
  }
  async function makeComputerMove () {
    const attacks = currentPlayer.gameboard.attacks // Convenience
    const priorityTargets = []

    // Helper function to convert "A1" to {row: 0, col: 0}
    function toRowCol (coord) {
      if (!coord || coord.length < 2) return null // Basic validation
      const letter = coord.charAt(0).toUpperCase()
      const number = parseInt(coord.substring(1))
      if (letter < 'A' || letter > 'J' || number < 1 || number > 10) return null // Validate bounds
      return { row: letter.charCodeAt(0) - 65, col: number - 1 }
    }

    // Helper function to convert {row: 0, col: 0} to "A1"
    function toCoordString (row, col) {
      if (row < 0 || row > 9 || col < 0 || col > 9) return null // Validate bounds
      return `${String.fromCharCode(65 + row)}${col + 1}`
    }

    // --- Smarter Targeting Logic ---
    // 1. Find all cells that were 'hit'
    const hitCells = []
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const cellCoord = toCoordString(r, c)
        // Assuming 'hit' is stored to indicate a successful hit.
        // If your provided line `attacks.get(...) !== null` specifically means a confirmed hit
        // (and not just "attacked, could be miss"), you could use that here.
        // e.g., if (attacks.get(cellCoord) !== null && attacks.get(cellCoord) !== 'miss')
        // For clarity and common usage, I'll use `=== 'hit'`.
        if (attacks.get(cellCoord) === 'hit') {
          hitCells.push(cellCoord)
        }
      }
    }

    // 2. For each hit cell, find its valid, unattacked neighbors
    if (hitCells.length > 0) {
      for (const hitCoord of hitCells) {
        const rc = toRowCol(hitCoord)
        if (!rc) continue

        const { row, col } = rc
        const potentialNeighborsCoords = [
          toCoordString(row - 1, col), // Up
          toCoordString(row + 1, col), // Down
          toCoordString(row, col - 1), // Left
          toCoordString(row, col + 1) // Right
        ]

        for (const neighborCoord of potentialNeighborsCoords) {
          if (neighborCoord && attacks.get(neighborCoord) === null) { // Valid and unattacked
            priorityTargets.push(neighborCoord)
          }
        }
      }
    }

    // 3. If priority targets exist, pick one
    if (priorityTargets.length > 0) {
      // Remove duplicates that might arise if multiple hits point to the same neighbor
      const uniquePriorityTargets = [...new Set(priorityTargets)]
      // Pick a random one from the priority targets to be less predictable
      return uniquePriorityTargets[Math.floor(Math.random() * uniquePriorityTargets.length)]
    }

    // --- Fallback to Original Random Shooting Logic ---
    let randomNumber, randomLetter, char, targetCoord
    let limit = 0

    // Loop until an unattacked spot is found
    do {
      limit++
      if (limit > 1000) { // Safety break for very full boards or unlikely scenarios
        console.warn('Computer move random selection limit reached. Searching for any available spot.')
        // As an absolute fallback, iterate the board to find *any* unattacked spot
        for (let r_fallback = 0; r_fallback < 10; r_fallback++) {
          for (let c_fallback = 0; c_fallback < 10; c_fallback++) {
            const fallbackCoord = toCoordString(r_fallback, c_fallback)
            if (attacks.get(fallbackCoord) === null) {
              return fallbackCoord
            }
          }
        }
        // If this is reached, something is very wrong (e.g., board is full but game didn't end)
        // Or all spots are 'miss' and the smart logic didn't find 'hit's.
        console.error('Computer could not find any valid move. Returning A1 as desperate measure.')
        return 'A1' // Should ideally not happen
      }

      randomNumber = Math.floor((10 * Math.random()) + 1) // 1-10
      randomLetter = Math.floor((10 * Math.random())) // 0-9 (for A-J)
      char = String.fromCharCode(65 + randomLetter)
      targetCoord = `${char}${randomNumber}`
    } while (attacks.get(targetCoord) !== null) // Keep trying if spot is already attacked (hit or miss)

    return targetCoord
  }
  function checkSunkenBoard () {
    if (currentPlayer.gameboard.isAllSunk()) {
      setWinner(otherPlayer)
      return true
    }
    if (otherPlayer.gameboard.isAllSunk()) {
      setWinner(currentPlayer)
      return true
    }
    return false
  }
  const boards = stage.querySelector('.boards')
  boards.style.animation = 'fadeInUpBig 1000ms forwards paused'
  async function ready () {
    Anim.startAnimation(boards)
    await Anim.onAnimationEnd(boards)
  }
  // main update loop (event-based)
  async function update (e) {
    if (!e.target.classList.contains('board-cell')) return
    const cell = e.target
    if (otherPlayer.gameboard.attacks.get(cell.dataset.coord)) {
      cell.style.animation = 'headShake 100ms paused'
      await Anim.onAnimation(cell)
      return
    }
    if (isUpdating) return
    isUpdating = true

    if (cell.classList.contains('board-cell')) {
      cell.style.animationName = 'bounceOut'
      cell.style.animationDuration = '200ms'
      cell.style.animationState = 'paused'
      await Anim.onAnimationEnd(cell)
      otherPlayer.gameboard.receiveAttack(cell.dataset.coord)
      cell.dataset.value = `${otherPlayer.gameboard.attacks.get(cell.dataset.coord)}`
      cell.style.animationName = cell.dataset.value === 'hit' ? 'flipInX' : 'fadeIn'
      cell.style.animationDuration = '300ms'
      cell.style.animationState = 'paused'
      await Anim.onAnimationEnd(cell)
      Anim.pauseAnimation(cell)
    }

    if (checkSunkenBoard()) { finishUp(); return }
    if (otherPlayer.isComputer) {
      const move = await makeComputerMove()
      const playerCell = document.querySelector(`.overlay [data-coord="${move}"]`)
      playerCell.style.animationName = 'bounceOut'
      playerCell.style.animationDuration = '200ms'
      playerCell.style.animationState = 'running'
      currentPlayer.gameboard.receiveAttack(playerCell.dataset.coord)
      playerCell.dataset.value = `${currentPlayer.gameboard.attacks.get(playerCell.dataset.coord)}`
      await Anim.onAnimationEnd(playerCell)
    } else /* IF there is another Player */ {
      await nextPlayer()
      isUpdating = false
      return
    }

    updateBoards()
    isUpdating = false
  }
  async function nextPlayer () {
    const div = document.createElement('div')
    div.className = 'next-player'
    div.innerHTML = `
    <div class="inner">
      <h1>${otherPlayer.name}'s Turn</h1>
      <button>Ready</button>
    </div>
    `

    // Let The current Player process their attack
    await Anim.wait(600)
    stage.append(div)

    // Wait for the slidein before switching or updating the Board
    div.style.animation = 'slideInRight 500ms cubic-bezier(0.075, 0.82, 0.165, 1) paused'
    await Anim.onAnimation(div)
    // update the board while no one is looking (unless the cheat)
    switchPlayer()
    updateBoards()

    // Now wait until the player is ready to remove the div
    const button = div.querySelector('button')
    await new Promise(r => button.addEventListener('click', r))
    div.style.animation = 'slideOutRight 300ms ease-in paused'
    await Anim.onAnimation(div)

    div.remove()
  }
  for (const container of boardContainers) {
    container.addEventListener('click', update)
  }
  updateBoards()
  const doneButton = document.createElement('button')
  function finishUp () {
    doneButton.click()
  }
  function isDone () {
    return new Promise(resolve => {
      doneButton.onclick = resolve
    })
  }
  async function done () {
    await Anim.wait(2000)
    boards.style.animation = 'fadeOutDownBig 1000ms forwards'
    await Anim.onAnimation(boards)
  }
  // ready()

  return Object.assign(new Stage(), { name: 'gameplay', stage, update, ready, done, isDone, finishUp, doneButton })
}
