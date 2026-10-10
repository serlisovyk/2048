import '../styles/main.css'

import { BOARD_SIZE, WIN_TILE } from './constants.js'
import { GameController } from './GameController.js'
import { Game } from './game/Game.js'
import { KeyboardInput } from './input/KeyboardInput.js'
import { SwipeInput } from './input/SwipeInput.js'
import { SafeStorage } from './storage/SafeStorage.js'
import { GridView } from './ui/GridView.js'
import { OverlayView } from './ui/OverlayView.js'
import { ScoreView } from './ui/ScoreView.js'

document.addEventListener('DOMContentLoaded', () => {
  const gridElement = document.querySelector('.game-grid')
  const newGameButton = document.querySelector('.new-game-button')

  const overlayView = new OverlayView({
    winElement: document.querySelector('.win-overlay'),
    gameOverElement: document.querySelector('.game-over'),
    continueButton: document.querySelector('.continue-button'),
    restartButton: document.querySelector('.restart-game-button'),
  })

  const controller = new GameController({
    game: new Game({ size: BOARD_SIZE, winTile: WIN_TILE }),
    gridView: new GridView(gridElement, BOARD_SIZE),
    scoreView: new ScoreView({
      scoreElement: document.querySelector('.current-score'),
      highScoreElement: document.querySelector('.high-score'),
    }),
    overlayView,
    storage: new SafeStorage(),
  })

  const requestMove = (direction) => controller.requestMove(direction)
  const restart = () => controller.restart()

  new KeyboardInput(document, requestMove).bind()
  new SwipeInput(document.querySelector('.game-container'), requestMove).bind()

  overlayView.onContinue(() => controller.continueAfterWin())
  overlayView.onRestart(restart)
  newGameButton.addEventListener('click', restart)

  controller.start()
})
