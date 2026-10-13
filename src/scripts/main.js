import '../styles/main.css'

import { SETTING_NAMES } from './constants.js'
import { GameController } from './GameController.js'
import { Game } from './game/Game.js'
import { Settings } from './game/Settings.js'
import { KeyboardInput } from './input/KeyboardInput.js'
import { SwipeInput } from './input/SwipeInput.js'
import { SafeStorage } from './storage/SafeStorage.js'
import { SettingsController } from './SettingsController.js'
import { ThemeController } from './ThemeController.js'
import { ConfirmDialogView } from './ui/ConfirmDialogView.js'
import { FooterView } from './ui/FooterView.js'
import { GridView } from './ui/GridView.js'
import { OverlayView } from './ui/OverlayView.js'
import { ScoreView } from './ui/ScoreView.js'
import { SettingsView } from './ui/SettingsView.js'
import { ThemeView } from './ui/ThemeView.js'

document.addEventListener('DOMContentLoaded', () => {
  const gridElement = document.querySelector('.game-grid')
  const newGameButton = document.querySelector('.new-game-button')
  const storage = new SafeStorage()

  const overlayView = new OverlayView({
    winDialog: document.querySelector('.win-overlay'),
    gameOverDialog: document.querySelector('.game-over'),
    continueButton: document.querySelector('.continue-button'),
    winRestartButton: document.querySelector('.win-restart-button'),
    restartButton: document.querySelector('.restart-game-button'),
    winMessage: document.querySelector('.win-message'),
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
    recordBadgeElement: document.querySelector('.record-badge'),
  })

  const settings = new Settings()

  const controller = new GameController({
    game: new Game({
      size: settings.get(SETTING_NAMES.BOARD_SIZE),
      winTile: settings.get(SETTING_NAMES.WIN_TILE),
    }),
    gridView: new GridView(gridElement),
    scoreView,
    overlayView,
    confirmDialogView,
    settings,
    storage,
  })

  const themeView = new ThemeView({
    root: document.documentElement,
    button: document.querySelector('.theme-toggle'),
    themeColorMetas: document.querySelectorAll('meta[name="theme-color"]'),
    reducedMotionQuery: matchMedia('(prefers-reduced-motion: reduce)'),
  })

  const themeController = new ThemeController({
    view: themeView,
    storage,
    systemQuery: matchMedia('(prefers-color-scheme: light)'),
  })

  const settingsView = new SettingsView({
    dialog: document.querySelector('.settings-dialog'),
    openButton: document.querySelector('.settings-button'),
    closeButton: document.querySelector('.settings-close-button'),
  })

  const settingsController = new SettingsController({
    settings,
    view: settingsView,
    gameController: controller,
    confirmDialogView,
    storage,
  })

  const footerView = new FooterView(document.querySelector('.footer-year'))

  const requestMove = (direction) => controller.requestMove(direction)
  const restart = () => controller.restart()

  new KeyboardInput(document, requestMove).bind()
  new SwipeInput(document.querySelector('.game-container'), requestMove).bind()

  overlayView.onContinue(() => controller.continueAfterWin())
  overlayView.onRestart(restart)
  overlayView.onClose(() => controller.returnFocusToBoard())
  scoreView.onResetHighScore(() => controller.requestResetHighScore())
  newGameButton.addEventListener('click', () => controller.requestNewGame())
  themeView.onToggle(() => themeController.toggle())
  settingsView.onOpen(() => settingsController.open())
  settingsView.onChange((name, value) =>
    settingsController.requestChange(name, value),
  )

  footerView.renderYear(new Date().getFullYear())
  themeController.start()
  settingsController.start()
  controller.start()
})
