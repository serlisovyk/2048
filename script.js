document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', handleKeydown)

  restartButtonElement.addEventListener('click', restartGame)
  newGameButtonElement.addEventListener('click', restartGame)
  continueButtonElement.addEventListener('click', hideWinOverlay)

  initializeGame()
})

const SIZE = 4

const ARROWS_KEYS = {
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
}

const gameGridElement = document.querySelector('.game-grid')
const currentScoreElement = document.querySelector('.current-score')
const highScoreElement = document.querySelector('.high-score')
const gameOverElement = document.querySelector('.game-over')
const winOverlayElement = document.querySelector('.win-overlay')
const cellElements = gameGridElement.querySelectorAll('.grid-cell')
const restartButtonElement = document.querySelector('.restart-game-button')
const continueButtonElement = document.querySelector('.continue-button')
const newGameButtonElement = document.querySelector('.new-game-button')

let board = []

let currentScore = 0

let highScore = Number(localStorage.getItem('highScore')) || 0

let hasWon = false

let isMoving = false

highScoreElement.textContent = highScore

function restartGame() {
  currentScore = 0
  currentScoreElement.textContent = currentScore
  hasWon = false
  gameOverElement.style.display = 'none'
  winOverlayElement.style.display = 'none'
  initializeGame()
}

function initializeGame() {
  board = [...Array(SIZE)].map(() => Array(SIZE).fill(0))

  placeRandom()
  placeRandom()

  renderBoard()
}

function handleKeydown(event) {
  if (Object.values(ARROWS_KEYS).includes(event.key)) {
    event.preventDefault()

    if (isMoving) return

    move(event.key)
  }
}

function renderBoard() {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const cell = gameGridElement.querySelector(
        `[data-row="${i}"][data-col="${j}"]`
      )

      const prevValue = cell.dataset.value
      const currentValue = board[i][j]

      if (currentValue !== 0) {
        cell.dataset.value = currentValue
        cell.textContent = currentValue

        if (currentValue !== +prevValue && !cell.classList.contains('new-cell')) {
          cell.classList.remove('merged-cell')
          void cell.offsetWidth
          cell.classList.add('merged-cell')
        }
      } else {
        cell.textContent = ''
        delete cell.dataset.value
        cell.classList.remove('merged-cell', 'new-cell')
      }
    }
  }

  setTimeout(() => {
    cellElements.forEach((cell) => {
      cell.classList.remove('merged-cell', 'new-cell')
    })
  }, 250)
}

function updateScore(value) {
  currentScore += value
  currentScoreElement.textContent = currentScore
  if (currentScore > highScore) {
    highScore = currentScore
    highScoreElement.textContent = highScore
    localStorage.setItem('highScore', highScore)
  }
}

function placeRandom() {
  const available = []

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] === 0) {
        available.push({ i, j })
      }
    }
  }

  if (available.length > 0) {
    const randomCell = available[Math.floor(Math.random() * available.length)]
    board[randomCell.i][randomCell.j] = Math.random() < 0.9 ? 2 : 4

    const cell = gameGridElement.querySelector(
      `[data-row="${randomCell.i}"][data-col="${randomCell.j}"]`
    )
    cell.classList.add('new-cell')
  }
}

function move(direction) {
  isMoving = true

  let hasChanged = false

  if (direction === ARROWS_KEYS.ArrowUp || direction === ARROWS_KEYS.ArrowDown) {
    for (let j = 0; j < SIZE; j++) {
      const column = [...Array(SIZE)].map((_, i) => board[i][j])
      const newColumn = transform(column, direction === ARROWS_KEYS.ArrowUp)

      for (let i = 0; i < SIZE; i++) {
        if (board[i][j] !== newColumn[i]) {
          hasChanged = true
          board[i][j] = newColumn[i]
        }
      }
    }
  } else if (
    direction === ARROWS_KEYS.ArrowLeft ||
    direction === ARROWS_KEYS.ArrowRight
  ) {
    for (let i = 0; i < SIZE; i++) {
      const row = board[i]
      const newRow = transform(row, direction === ARROWS_KEYS.ArrowLeft)

      if (row.join(',') !== newRow.join(',')) {
        hasChanged = true
        board[i] = newRow
      }
    }
  }

  if (hasChanged) {
    placeRandom()
    renderBoard()
    checkWin()
    checkGameOver()
  }

  setTimeout(() => (isMoving = false), 100)
}

function transform(line, moveTowardsStart) {
  let newLine = line.filter((cell) => cell !== 0)

  if (!moveTowardsStart) newLine.reverse()

  for (let i = 0; i < newLine.length - 1; i++) {
    if (newLine[i] === newLine[i + 1]) {
      newLine[i] *= 2
      updateScore(newLine[i])
      newLine.splice(i + 1, 1)
    }
  }

  while (newLine.length < SIZE) {
    newLine.push(0)
  }

  if (!moveTowardsStart) newLine.reverse()

  return newLine
}

function checkWin() {
  if (hasWon) return

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] === 2048) {
        hasWon = true
        winOverlayElement.style.display = 'flex'
        return
      }
    }
  }
}

function checkGameOver() {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (
        board[i][j] === 0 ||
        (j < SIZE - 1 && board[i][j] === board[i][j + 1]) ||
        (i < SIZE - 1 && board[i][j] === board[i + 1][j])
      ) {
        return
      }
    }
  }

  gameOverElement.style.display = 'flex'
}

function hideWinOverlay() {
  winOverlayElement.style.display = 'none'
}
