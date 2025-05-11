import { Ship } from '@/classes/Ship'

export function getBoardDiv (map = new Map(), attacks = false) {
  const div = document.createElement('div')
  div.className = 'board'
  if (attacks) div.className += ' attacks'
  let html = ''
  for (const [key, value] of map) {
    html += `<div class="board-cell" coord="${key}" value="${
      (() => {
        if (value instanceof Ship) return 'ship'
        return value
      })()
    }"></div>`
  }
  div.innerHTML = html
  return div
}

export function getBoardHTML (map, attacks = false) {
  const div = document.createElement('div')
  div.appendChild(getBoardDiv(map, attacks))
  return div.innerHTML
}
