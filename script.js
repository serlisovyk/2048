import './styles/main.css'

document.addEventListener('DOMContentLoaded', () => {
  createGrid()

  document.addEventListener('keydown', handleKeydown)
  gameGridElement.addEventListener('pointerdown', handlePointerDown)
  gameGridElement.addEventListener('pointerup', handlePointerUp)
  gameGridElement.addEventListener('pointercancel', resetPointer)

  restartButtonElement.addEventListener('click', restartGame)
  newGameButtonElement.addEventListener('click', restartGame)
  continueButtonElement.addEventListener('click', hideWinOverlay)

  initializeGame()
})

const SIZE = 4
const SWIPE_THRESHOLD = 30

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
const restartButtonElement = document.querySelector('.restart-game-button')
const continueButtonElement = document.querySelector('.continue-button')
const newGameButtonElement = document.querySelector('.new-game-button')

let board = []
let cellElements = []
let pointerStart = null

let currentScore = 0

let highScore = Number(localStorage.getItem('highScore')) || 0

let hasWon = false

let isMoving = false
let isPausedAfterWin = false
let isGameOver = false
let animationCleanupTimeoutId = null

highScoreElement.textContent = highScore

function createGrid() {
  gameGridElement.innerHTML = ''
  gameGridElement.tabIndex = -1

  cellElements = [...Array(SIZE)].map((_, row) =>
    [...Array(SIZE)].map((_, col) => {
      const cell = document.createElement('div')

      cell.className = 'grid-cell'
      cell.dataset.row = row
      cell.dataset.col = col

      gameGridElement.append(cell)

      return cell
    }),
  )
}

function restartGame() {
  currentScore = 0
  currentScoreElement.textContent = currentScore

  hasWon = false
  isPausedAfterWin = false
  isGameOver = false

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
  if (!Object.values(ARROWS_KEYS).includes(event.key)) return

  event.preventDefault()
  requestMove(event.key)
}

function handlePointerDown(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return

  pointerStart = {
    x: event.clientX,
    y: event.clientY,
  }
}

function handlePointerUp(event) {
  if (!pointerStart) return

  const deltaX = event.clientX - pointerStart.x
  const deltaY = event.clientY - pointerStart.y
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)

  resetPointer()

  if (Math.max(absX, absY) < SWIPE_THRESHOLD) return

  const direction =
    absX > absY
      ? deltaX > 0
        ? ARROWS_KEYS.ArrowRight
        : ARROWS_KEYS.ArrowLeft
      : deltaY > 0
        ? ARROWS_KEYS.ArrowDown
        : ARROWS_KEYS.ArrowUp

  requestMove(direction)
}

function resetPointer() {
  pointerStart = null
}

function requestMove(direction) {
  if (isMoving || isPausedAfterWin || isGameOver) return

  move(direction)
}

function renderBoard() {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const cell = cellElements[i][j]
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

  clearTimeout(animationCleanupTimeoutId)

  animationCleanupTimeoutId = setTimeout(() => {
    cellElements
      .flat()
      .forEach((cell) => cell.classList.remove('merged-cell', 'new-cell'))
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

    cellElements[randomCell.i][randomCell.j].classList.add('new-cell')
  }
}

function move(direction) {
  isMoving = true

  let hasChanged = false
  let scoreGained = 0

  if (direction === ARROWS_KEYS.ArrowUp || direction === ARROWS_KEYS.ArrowDown) {
    for (let j = 0; j < SIZE; j++) {
      const column = [...Array(SIZE)].map((_, i) => board[i][j])
      const result = transform(column, direction === ARROWS_KEYS.ArrowUp)

      for (let i = 0; i < SIZE; i++) {
        if (board[i][j] !== result.line[i]) {
          hasChanged = true
          board[i][j] = result.line[i]
        }
      }

      scoreGained += result.scoreGained
    }
  } else if (
    direction === ARROWS_KEYS.ArrowLeft ||
    direction === ARROWS_KEYS.ArrowRight
  ) {
    for (let i = 0; i < SIZE; i++) {
      const row = board[i]
      const result = transform(row, direction === ARROWS_KEYS.ArrowLeft)

      if (row.join(',') !== result.line.join(',')) {
        hasChanged = true
        board[i] = result.line
      }

      scoreGained += result.scoreGained
    }
  }

  if (hasChanged) {
    updateScore(scoreGained)
    placeRandom()
    renderBoard()
    checkWin()
    checkGameOver()
  }

  setTimeout(() => (isMoving = false), 100)
}

function transform(line, moveTowardsStart) {
  let newLine = line.filter((cell) => cell !== 0)
  let scoreGained = 0

  if (!moveTowardsStart) newLine.reverse()

  for (let i = 0; i < newLine.length - 1; i++) {
    if (newLine[i] === newLine[i + 1]) {
      newLine[i] *= 2
      scoreGained += newLine[i]
      newLine.splice(i + 1, 1)
    }
  }

  while (newLine.length < SIZE) {
    newLine.push(0)
  }

  if (!moveTowardsStart) newLine.reverse()

  return {
    line: newLine,
    scoreGained,
  }
}

function checkWin() {
  if (hasWon) return

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] === 2048) {
        hasWon = true
        isPausedAfterWin = true
        winOverlayElement.style.display = 'flex'
        continueButtonElement.focus()
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

  isGameOver = true
  gameOverElement.style.display = 'flex'
  restartButtonElement.focus()
}

function hideWinOverlay() {
  isPausedAfterWin = false
  winOverlayElement.style.display = 'none'
  gameGridElement.focus()
}
