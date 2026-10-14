import '../styles/main.css'

import { SETTING_NAMES } from './constants.js'
import { GameController } from './controllers/GameController.js'
import { HighScoreController } from './controllers/HighScoreController.js'
import { SavedGameController } from './controllers/SavedGameController.js'
import { SettingsController } from './controllers/SettingsController.js'
import { StatisticsController } from './controllers/StatisticsController.js'
import { ThemeController } from './controllers/ThemeController.js'
import { Game } from './game/Game.js'
import { Settings } from './game/Settings.js'
import { Statistics } from './game/Statistics.js'
import { KeyboardInput } from './input/KeyboardInput.js'
import { SwipeInput } from './input/SwipeInput.js'
import { SafeStorage } from './storage/SafeStorage.js'
import { ConfirmDialogView } from './ui/ConfirmDialogView.js'
import { FooterView } from './ui/FooterView.js'
import { GridView } from './ui/GridView.js'
import { NewGameView } from './ui/NewGameView.js'
import { OverlayView } from './ui/OverlayView.js'
import { ScoreView } from './ui/ScoreView.js'
import { SettingsView } from './ui/SettingsView.js'
import { ThemeView } from './ui/ThemeView.js'

const storage = new SafeStorage()
const settings = new Settings()
const statisticsController = new StatisticsController({
  statistics: new Statistics(),
  storage,
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
const overlayView = new OverlayView({
  winDialog: document.querySelector('.win-overlay'),
  gameOverDialog: document.querySelector('.game-over'),
  continueButton: document.querySelector('.continue-button'),
  winRestartButton: document.querySelector('.win-restart-button'),
  gameOverRestartButton: document.querySelector('.restart-game-button'),
  winMessage: document.querySelector('.win-message'),
  gameOverWinNote: document.querySelector('.game-over-win-note'),
})
const gridView = new GridView({ element: document.querySelector('.game-grid') })
const newGameView = new NewGameView({
  button: document.querySelector('.new-game-button'),
})

const gameController = new GameController({
  game: new Game({
    size: settings.get(SETTING_NAMES.BOARD_SIZE),
    winTile: settings.get(SETTING_NAMES.WIN_TILE),
  }),
  gridView,
  scoreView,
  overlayView,
  confirmDialogView,
  settings,
  highScoreController: new HighScoreController({ scoreView, storage }),
  savedGameController: new SavedGameController({ storage }),
  statisticsController,
})

new KeyboardInput({
  target: document,
  onDirection: (direction) => gameController.requestMove(direction),
}).bind()
new SwipeInput({
  element: document.querySelector('.game-container'),
  onDirection: (direction) => gameController.requestMove(direction),
}).bind()

overlayView.onContinue(() => gameController.continueAfterWin())
overlayView.onRestart(() => gameController.restart())
overlayView.onClose(() => gameController.returnFocusToBoard())
scoreView.onResetHighScore(() => gameController.requestResetHighScore())
newGameView.onNewGame(() => gameController.requestNewGame())

const settingsView = new SettingsView({
  dialog: document.querySelector('.settings-dialog'),
  openButton: document.querySelector('.settings-button'),
  closeButton: document.querySelector('.settings-close-button'),
  resetStatisticsButton: document.querySelector('.reset-statistics-button'),
})
const settingsController = new SettingsController({
  settings,
  view: settingsView,
  gameController,
  statisticsController,
  confirmDialogView,
  storage,
})

settingsView.onOpen(() => settingsController.open())
settingsView.onChange((name, value) => settingsController.requestChange(name, value))
settingsView.onResetStatistics(() => settingsController.requestResetStatistics())

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

themeView.onToggle(() => themeController.toggle())

const footerView = new FooterView({
  yearElement: document.querySelector('.footer-year'),
})

footerView.renderYear(new Date().getFullYear())
themeController.start()
settingsController.start()
statisticsController.start()
gameController.start()
