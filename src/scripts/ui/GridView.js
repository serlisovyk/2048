import { ANIMATION_CLEANUP_MS } from '../constants.js'

export class GridView {
  #element
  #cells
  #cleanupTimeoutId = null

  constructor(element, size) {
    this.#element = element
    this.#cells = this.#createCells(size)
  }

  focus() {
    this.#element.focus()
  }

  render(values, spawnedTiles = []) {
    spawnedTiles.forEach(({ row, col }) => {
      this.#cells[row][col].classList.add('new-cell')
    })

    values.forEach((rowValues, row) => {
      rowValues.forEach((value, col) => {
        this.#renderCell(this.#cells[row][col], value)
      })
    })

    this.#scheduleAnimationCleanup()
  }

  #createCells(size) {
    this.#element.innerHTML = ''
    this.#element.tabIndex = -1

    return Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, col) => {
        const cell = document.createElement('div')

        cell.className = 'grid-cell'
        cell.dataset.row = row
        cell.dataset.col = col

        this.#element.append(cell)

        return cell
      }),
    )
  }

  #renderCell(cell, value) {
    if (value === 0) {
      cell.textContent = ''
      delete cell.dataset.value
      cell.classList.remove('merged-cell', 'new-cell')

      return
    }

    const previousValue = Number(cell.dataset.value)

    cell.dataset.value = value
    cell.textContent = value

    if (value !== previousValue && !cell.classList.contains('new-cell')) {
      cell.classList.remove('merged-cell')
      void cell.offsetWidth
      cell.classList.add('merged-cell')
    }
  }

  #scheduleAnimationCleanup() {
    clearTimeout(this.#cleanupTimeoutId)

    this.#cleanupTimeoutId = setTimeout(() => {
      this.#cells
        .flat()
        .forEach((cell) => cell.classList.remove('merged-cell', 'new-cell'))
    }, ANIMATION_CLEANUP_MS)
  }
}
