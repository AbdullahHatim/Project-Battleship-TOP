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
    boardContainers[1].append(getBoardDiv(otherPlayer.gameboard.attacks, true))
  }
  async function makeComputerMove () {
    let randomNumber = Math.floor((10 * Math.random()) + 1)
    let randomLetter = Math.floor((10 * Math.random()))
    let char = String.fromCharCode(65 + randomLetter)
    let limit = 0
    while (currentPlayer.gameboard.attacks.get(`${char}${randomNumber}`) !== null) {
      limit++
      if (limit > 1000) break
      randomNumber = Math.floor((10 * Math.random()) + 1)
      randomLetter = Math.floor((10 * Math.random()))
      char = String.fromCharCode(65 + randomLetter)
    }
    return `${char}${randomNumber}`
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
