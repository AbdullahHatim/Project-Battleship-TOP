import { Ship } from './Ship'

export class Gameboard {
  board = new Map()
  attacks
  constructor () {
    this.generateBoard()
    this.attacks = new Map(this.board)
  }

  generateBoard () {
    for (let i = 0; i < 10; i++) {
      const char = String.fromCharCode(65 + i)
      for (let k = 1; k <= 10; k++) {
        this.board.set(`${char}${k}`, null)
      }
    }
  }

  static verifyCoords (coords) {
    if (coords.length < 2) return

    const isValidArray = (arr) => {
      const pattern = /^[A-Z]\d+$/
      return Array.isArray(arr) && arr.every(item => typeof item === 'string' && pattern.test(item))
    }
    if (!isValidArray(coords)) throw new TypeError('Coords should be like "A1" or "J10"')

    const removeFirstLetter = (str) => {
      return str.slice(1)
    }
    const getFirstLetterCode = str => str.charCodeAt(0)

    // null, -1: decremental, 1: incremental
    const getArrayOrderType = (arr = []) => {
      if (arr.length < 2) return null
      if (arr[0] > arr[1]) return -1
      else return 1
    }
    const isNumbersInOrder = (numbers = []) => {
      const order = getArrayOrderType(numbers)
      return numbers.every((n, i) => {
        if (i === 0) return true
        const prevN = numbers[i - 1]
        // check between curr and prev
        if (!(prevN + order === n)) {
          // check between curr and first
          if (!(n + order === numbers[0] && n - order === numbers[0])) {
            return false
          }
        }
        return true
      })
    }
    const isLettersInOrder = (letters = []) => {
      // Check if all letters are the same
      const isSame = letters.every(l => l === letters[0])
      // or in correct order
      const isInOrder = isNumbersInOrder(letters)
      if (isSame) return 1
      if (isInOrder) return -1
      else return false
    }
    const isSameNumbers = (numbers = []) => {
      return numbers.every(n => n === numbers[0])
    }
    const numbers = coords.map(s => removeFirstLetter(s) * 1)
    const letterCodes = coords.map(s => getFirstLetterCode(s))

    const result = isLettersInOrder(letterCodes)
    if (result) {
      if (result === 1) {
        if (!(isNumbersInOrder(numbers))) throw new Error()
      }
      if (result === -1) {
        if (!(isSameNumbers(numbers))) throw new Error()
      }
    } else {
      throw new Error()
    }
  }

  placeShip (...coords) {
    Gameboard.verifyCoords(coords)

    const ship = new Ship(coords.length)
    for (const pos of coords) {
      this.board.set(pos, ship)
    }
  }

  receiveAttack (coord) {
    if (typeof coord !== 'string' || !/^[A-Z]\d+$/.test(coord)) return
    const ship = this.board.get(coord)
    if (ship) {
      this.attacks.set(coord, 'hit')
      ship.hit()
    } else {
      this.attacks.set(coord, 'miss')
    }
  }

  isAllSunk () {
    let flag = true
    this.board.forEach((ship, coord) => {
      if (!ship) return
      if (!ship.isSunk()) flag = false
    })
    return flag
  }
}
