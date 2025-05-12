import { Gameboard } from '@/classes/Gameboard'
import { Player } from '@/classes/Player'
import { Ship } from '@/classes/Ship'
import { getBoardHTML, getBoardDiv } from './components/board'
import * as Anim from './components/animations'
import 'animate.css'
import './game.css'
import './animation.css'
import { Stage } from './components/Stage'

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
// where all the magic happens (connects everything together, DOM, Players, and Game flow/ Animations)
function gameController () {
  const players = [new Player('player1'), new Player('computer', true)]
  let currentPlayer = players[0]
  let otherPlayer = players[1]

  currentPlayer.gameboard.placeShip('A1', 'A2')
  currentPlayer.gameboard.placeShip('B5', 'C5', 'D5', 'E5', 'F5')
  currentPlayer.gameboard.placeShip('J10')
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
      <div class="board-container" data-name="${currentPlayer.name}">
      </div>
      <div class="board-container attacks" data-name="Attack ${otherPlayer.name}">
      </div>
    </div>`

    stage2.innerHTML = html
    const boardContainers = stage2.querySelectorAll('.board-container')

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

    const boards = stage2.querySelector('.boards')
    boards.style.animation = 'fadeInUpBig 1000ms forwards paused'
    // boards.style.animationState = 'paused'
    // Anim.startAnimation(boards)
    // Anim.pauseAnimation(boards)
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

    async function done () {
      boards.style.animation = 'fadeOutDownBig 1000ms forwards paused'
      Anim.startAnimation(boards)
      await Anim.onAnimationEnd(boards)
    }
    // ready()
    const stage = new Stage()
    Object.assign(stage, { stage: stage2, update, ready, done })
    return stage
  }
  let currentStage
  const setStage = async (stageCB) => {
    if (currentStage) await currentStage.done()
    currentStage = stageCB()
    Stage.validateProperties(currentStage)
    stageContent.innerHTML = ''
    stageContent.appendChild(currentStage.stage)
    await currentStage.ready()
  }
  setStage(getStage2)
  // (async () => { await new Promise(r => setTimeout(r, 3000)); setStage(getStage2); console.log('done') })()
  function refreshStage () {
    currentStage.update()
  }

  // Object.assign(gameController, { players, resetPlayers, switchPlayer, refreshStage })
}

export { gameController }
