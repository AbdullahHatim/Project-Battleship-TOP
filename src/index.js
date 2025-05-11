import './styles.css'
import { gameController } from './ui/GameController'

gameController()
// function generateBoard () {
//   const map = new Map()
//   for (let i = 0; i < 10; i++) {
//     const char = String.fromCharCode(65 + i)
//     for (let k = 1; k <= 10; k++) {
//       map.set(`${char}${k}`, null)
//     }
//   }
//   return map
// }
// const map = generateBoard()
// document.body.appendChild(getBoardDiv(map))
