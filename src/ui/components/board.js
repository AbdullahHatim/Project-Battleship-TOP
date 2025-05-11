function getBoardDiv (map = new Map()) {
  const div = document.createElement('div')
  div.className = 'board'
  let html = ''
  for (const [key, value] of map) {
    html += `<div class="board-cell" coord="${key}" value="${value}"></div>`
  }
  div.innerHTML = html
  return div
}

export function getBoardHTML (map) {
  const div = document.createElement('div')
  div.appendChild(getBoardDiv(map))
  return div.innerHTML
}
