import '../styles/main.css'

import { BOARD_SIZE, WIN_TILE } from './constants.js'
import { GameController } from './GameController.js'
import { Game } from './game/Game.js'
import { KeyboardInput } from './input/KeyboardInput.js'
import { SwipeInput } from './input/SwipeInput.js'
import { SafeStorage } from './storage/SafeStorage.js'
import { ConfirmDialogView } from './ui/ConfirmDialogView.js'
import { GridView } from './ui/GridView.js'
import { OverlayView } from './ui/OverlayView.js'
import { ScoreView } from './ui/ScoreView.js'

document.addEventListener('DOMContentLoaded', () => {
  const gridElement = document.querySelector('.game-grid')
  const newGameButton = document.querySelector('.new-game-button')

  const overlayView = new OverlayView({
    winDialog: document.querySelector('.win-overlay'),
    gameOverDialog: document.querySelector('.game-over'),
    continueButton: document.querySelector('.continue-button'),
    winRestartButton: document.querySelector('.win-restart-button'),
    restartButton: document.querySelector('.restart-game-button'),
    winNote: document.querySelector('.game-over-win-note'),
  })

  const confirmDialogView = new ConfirmDialogView({
    dialog: document.querySelector('.confirm-dialog'),
    titleElement: document.querySelector('.confirm-title'),
    messageElement: document.querySelector('.confirm-message'),
    cancelButton: document.querySelector('.confirm-cancel-button'),
    confirmButton: document.querySelector('.confirm-accept-button'),
  })

  const scoreView = new ScoreView({
    scoreElement: document.querySelector('.current-score'),
    announcementElement: document.querySelector('.score-announcement'),
    popsElement: document.querySelector('.score-pops'),
    highScoreElement: document.querySelector('.high-score'),
    resetHighScoreButton: document.querySelector('.reset-high-score-button'),
  })

  const controller = new GameController({
    game: new Game({ size: BOARD_SIZE, winTile: WIN_TILE }),
    gridView: new GridView(gridElement, BOARD_SIZE),
    scoreView,
    overlayView,
    confirmDialogView,
    storage: new SafeStorage(),
  })

  const requestMove = (direction) => controller.requestMove(direction)
  const restart = () => controller.restart()

  new KeyboardInput(document, requestMove).bind()
  new SwipeInput(document.querySelector('.game-container'), requestMove).bind()

  overlayView.onContinue(() => controller.continueAfterWin())
  overlayView.onRestart(restart)
  overlayView.onClose(() => controller.returnFocusToBoard())
  scoreView.onResetHighScore(() => controller.requestResetHighScore())
  newGameButton.addEventListener('click', () => controller.requestNewGame())

  controller.start()
})
