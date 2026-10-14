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

  start() {
    const saved = this.#storage.getJson(STORAGE_KEYS.SETTINGS)

    if (saved?.version === SETTINGS_VERSION) this.#settings.restore(saved)
  }

  open() {
    this.#render()
    this.#view.open()
  }

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

  async requestResetStatistics() {
    const isConfirmed = await this.#askFromSettings(
      SettingsController.#RESET_STATISTICS_PROMPT,
    )

    if (!isConfirmed) return

    this.#statisticsController.reset()
    this.#gameController.returnFocusToBoard()
  }

  async #askFromSettings(prompt) {
    this.#view.close()

    const isConfirmed = await this.#confirmDialogView.ask(prompt)

    if (!isConfirmed) this.open()

    return isConfirmed
  }

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
