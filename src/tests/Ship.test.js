/* eslint-disable */
// Begin your app by creating the Ship class/factory (your choice).
// Your ‘ships’ will be objects that include their length, the number of times they’ve been hit and whether or not they’ve been sunk.
// REMEMBER you only have to test your object’s public interface. Only methods or properties that are used outside of your ‘ship’ object need unit tests.
// Ships should have a hit() function that increases the number of ‘hits’ in your ship.
// isSunk() should be a function that calculates whether a ship is considered sunk based on its length and the number of hits it has received.

import { Ship } from "@/classes/Ship"

let ship
beforeEach(()=>{
  ship = new Ship()
})

describe('Ship Properties Check', () => {
  test('length, hits and sunk', () => {
    expect(ship.length).toBeDefined()
    expect(ship.hits).toBeDefined()
    expect(ship.sunk).toBeDefined()
  })
})
describe('Ships interface tests', () =>{
  test('hit()', ()=>{
    ship.hit()
    ship.hit()
    expect(ship.hits).toBe(2)
  })
  test('isSunk()', ()=>{
    ship.length = 2
    ship.hit()
    ship.hit()
    expect(ship.isSunk()).toBe(true)
  })
})

