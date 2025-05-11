import { Gameboard } from './Gameboard'
export class Player {
  name
  isComputer = false
  gameboard = new Gameboard()

  constructor (name, isComputer = false) {
    this.name = name
    this.isComputer = isComputer
  }
}
