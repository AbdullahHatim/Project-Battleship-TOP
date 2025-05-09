/* eslint-disable */
// Note that we have not yet created any User Interface. We should know our code is coming together by running the tests. You shouldn’t be relying on console.log or DOM methods to make sure your code is doing what you expect it to.
// Gameboards should be able to place ships at specific coordinates by calling the ship factory or class.
// Gameboards should have a receiveAttack function that takes a pair of coordinates, determines whether or not the attack hit a ship and then sends the ‘hit’ function to the correct ship, or records the coordinates of the missed shot.
// Gameboards should keep track of missed attacks so they can display them properly.
// Gameboards should be able to report whether or not all of their ships have been sunk.
import { Gameboard } from '@/classes/Gameboard'
import { Ship } from '@/classes/Ship'

let gameboard
beforeEach(() => {
  gameboard = new Gameboard()
})

describe('gameboard.board is setup', () => {
  test('type and keys', () => {
    expect(gameboard.board instanceof Map).toBe(true)
    expect(gameboard.board.size).toBe(100)
    expect(gameboard.board.get('A1')).toBeDefined()
    expect(gameboard.board.get('A11')).toBeUndefined()
  })
})
describe('gameboard.attacks is setup', () => {
  test('type and keys', () => {
    expect(gameboard.attacks instanceof Map).toBe(true)
    expect(gameboard.attacks.size).toBe(100)
    expect(gameboard.attacks.get('A1')).toBeDefined()
    expect(gameboard.attacks.get('A11')).toBeUndefined()
  })
})

describe('gameboard.placeShip()', () =>{
describe('Ships Placement', () => {
  test('length of 1', () => {
    gameboard.placeShip('A2')
    expect(gameboard.board.get('A2') instanceof Ship).toBe(true)

    gameboard.placeShip('J10')

    expect(gameboard.board.get('J10') instanceof Ship).toBe(true)
  })
  test('length of 2', () => {
    gameboard.placeShip('A2', 'A3')
    const ship1Ref1 = gameboard.board.get('A2')
    const ship1Ref2 = gameboard.board.get('A3')
    expect(ship1Ref1 === ship1Ref2).toBe(true)
    
    gameboard.placeShip('J10', 'J9')
    const ship2Ref1 = gameboard.board.get('J10')
    const ship2Ref2 = gameboard.board.get('J9')
    expect(ship2Ref1 === ship2Ref2).toBe(true)
  })
  test('length of N', () =>{
    gameboard.placeShip(...['A1','A2','A3','A4'])
    const shipRef1 = gameboard.board.get('A1')
    const shipRef2 = gameboard.board.get('A4')
    expect(shipRef1 === shipRef2).toBe(true)
  })
})

describe('Wrong Ship Placement', () => {
  test('Discrete Ship (Same Letter)', () => {
    expect(() => gameboard.placeShip('A1', 'A3')).toThrow()
    expect(() => gameboard.placeShip('A1', 'A0')).not.toThrow()
    expect(() => gameboard.placeShip('A1', 'A2', 'A10')).toThrow()
    expect(() => gameboard.placeShip('A1', 'A2', 'A0')).toThrow()
  })
  test('Discrete Ship (Same Number)', () => {
    expect(() => gameboard.placeShip('A1', 'B2')).toThrow()
    expect(() => gameboard.placeShip('A1', 'B1', 'D1')).toThrow()
    expect(() => gameboard.placeShip('A1', 'B1', 'C1')).not.toThrow()
  })
})

describe('placeShip() should only accept arrays of strings of coords', () => {
  test('test cases', () => {
    expect(() => gameboard.placeShip('A1', 'b2')).toThrow()
    expect(() => gameboard.placeShip('A1', 'B1', 'D')).toThrow()
    expect(() => gameboard.placeShip('A1', 'BB1', 'C1')).toThrow()
    expect(() => gameboard.placeShip('A1', '100', 'C1')).toThrow()
    expect(() => gameboard.placeShip('A1', 10)).toThrow()
  })
})
})

describe('gameboard.receiveAttack()', () =>{
  describe('recieveAttack records attack', () => {
    test('attack registers in gameboard.attacks', () => {
      gameboard.receiveAttack('A1')
    let str = gameboard.attacks.get('A1')
    expect(str === 'miss' || str === 'hit').toBe(true)
    str = gameboard.attacks.get('A2')
    expect(str === 'miss' || str === 'hit').toBe(false)
    })
    test('Attack correctly reflects a hit or a miss', () =>{
      gameboard.placeShip('A1', 'A2')
      const shipRef = gameboard.board.get('A1')
      gameboard.receiveAttack('A1')
      gameboard.receiveAttack('A3')
      const hit = gameboard.attacks.get('A1')
      expect(hit).toBe('hit')
      const miss = gameboard.attacks.get('A3')
      expect(miss).toBe('miss')
      expect(gameboard.attacks.get('A4')).toBe(null)
    })
  })
})

describe('gameboard.isAllSunk()', () =>{
  test('exists', () =>{
    expect(gameboard.isAllSunk).toBeDefined()
  })
  test('place ships and sink them them 1', () =>{
    gameboard.placeShip('A1', 'A2')
    gameboard.placeShip('A3', 'B3')
    gameboard.receiveAttack('A2')
    gameboard.receiveAttack('A1')

    expect(gameboard.isAllSunk()).toBe(false)
    
    gameboard.receiveAttack('A3')
    gameboard.receiveAttack('B3')
    expect(gameboard.isAllSunk()).toBe(true)
  })
  test('place ships and sink them them 2', () =>{
    gameboard.placeShip('A1', 'A2')
    gameboard.placeShip('J10', 'J9', 'J8', 'J7')
    gameboard.placeShip('A9')

    gameboard.receiveAttack('A1')    
    gameboard.receiveAttack('A2')    
    gameboard.receiveAttack('J10')    
    gameboard.receiveAttack('J9')    
    gameboard.receiveAttack('J8')    
    gameboard.receiveAttack('J7')    
    
    expect(gameboard.isAllSunk()).toBe(false)
    
    gameboard.receiveAttack('A9')    
    expect(gameboard.isAllSunk()).toBe(true)
  })
})