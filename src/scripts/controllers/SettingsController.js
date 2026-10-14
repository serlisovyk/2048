import { SETTING_NAMES, SETTINGS_VERSION, STORAGE_KEYS } from '../constants.js'

export class SettingsController {
  static #CHANGE_PROMPT = Object.freeze({
    title: 'Start a new game?',
    message:
      'Changing this setting starts a new game. Your current progress will be lost.',
    confirmLabel: 'New Game',
  })

  static #RESET_STATISTICS_PROMPT = Object.freeze({
    title: 'Reset the statistics?',
    message:
      'Games played, wins, best score and best tile will be set back to 0. High scores and your current game are not affected.',
    confirmLabel: 'Reset',
  })

  #settings
  #view
  #gameController
  #statisticsController
  #confirmDialogView
  #storage

  constructor({
    settings,
    view,
    gameController,
    statisticsController,
    confirmDialogView,
    storage,
  }) {
    this.#settings = settings
    this.#view = view
    this.#gameController = gameController
    this.#statisticsController = statisticsController
    this.#confirmDialogView = confirmDialogView
    this.#storage = storage
  }

  // Runs before GameController.start(), so a game built from a setting sees the stored one.
  start() {
    const saved = this.#storage.getJson(STORAGE_KEYS.SETTINGS)

    if (saved?.version === SETTINGS_VERSION) this.#settings.restore(saved)
  }

  open() {
    this.#render()
    this.#view.open()
  }

  // A setting starts a new game, so a game in progress is asked about first (the settings
  // returns on "no", showing the stored value again).
  async requestChange(name, value) {
    if (!this.#settings.isNewValue(name, value)) {
      this.#render()
      return
    }

    if (!this.#gameController.isInProgress) {
      this.#apply(name, value)
      this.#render()
      this.#gameController.restart()
      return
    }

    const isConfirmed = await this.#askFromSettings(
      SettingsController.#CHANGE_PROMPT,
    )

    if (!isConfirmed) return

    this.#apply(name, value)
    this.#gameController.restartAndFocus()
  }

  // The reset only touches the statistics: the high scores and the current game stay.
  async requestResetStatistics() {
    const isConfirmed = await this.#askFromSettings(
      SettingsController.#RESET_STATISTICS_PROMPT,
    )

    if (!isConfirmed) return

    this.#statisticsController.reset()
    this.#gameController.returnFocusToBoard()
  }

  // Only one dialog is ever open: the settings closes for the question and opens again on
  // "no", rendered from the stored values, so a refused action needs no revert.
  async #askFromSettings(prompt) {
    this.#view.close()

    const isConfirmed = await this.#confirmDialogView.ask(prompt)

    if (!isConfirmed) this.open()

    return isConfirmed
  }

  // The win target's choices follow the board size, so the view is given them each time.
  #render() {
    this.#view.render(this.#settings.toState(), {
      [SETTING_NAMES.WIN_TILE]: this.#settings.getAllowedValues(
        SETTING_NAMES.WIN_TILE,
      ),
    })
    this.#view.renderStatistics(this.#statisticsController.values)
  }

  #apply(name, value) {
    this.#settings.set(name, value)
    this.#persist()
  }

  #persist() {
    this.#storage.setJson(STORAGE_KEYS.SETTINGS, {
      version: SETTINGS_VERSION,
      ...this.#settings.toState(),
    })
  }
}
