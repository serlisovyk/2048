import { SETTING_NAMES, SETTINGS_VERSION, STORAGE_KEYS } from './constants.js'

export class SettingsController {
  static #CHANGE_PROMPT = Object.freeze({
    title: 'Start a new game?',
    message:
      'Changing this setting starts a new game. Your current progress will be lost.',
    confirmLabel: 'New Game',
  })

  #settings
  #view
  #gameController
  #confirmDialogView
  #storage

  constructor({ settings, view, gameController, confirmDialogView, storage }) {
    this.#settings = settings
    this.#view = view
    this.#gameController = gameController
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

  // A setting starts a new game, so a game in progress is asked about first. Only one
  // dialog is ever open: the settings closes for the question and returns on "no", showing
  // the stored value again.
  async requestChange(name, value) {
    if (!this.#settings.isChange(name, value)) {
      this.#render()

      return
    }

    const isAsked = this.#gameController.isInProgress

    if (isAsked) {
      this.#view.close()

      if (!(await this.#confirmDialogView.ask(SettingsController.#CHANGE_PROMPT))) {
        this.open()

        return
      }
    }

    this.#settings.set(name, value)
    this.#persist()
    // The dialog is still open when nothing was asked, and a size change changes the
    // choices of the win target.
    this.#render()
    this.#gameController.restart()

    if (isAsked) this.#gameController.returnFocusToBoard()
  }

  // The win target's choices follow the board size, so the view is given them each time.
  #render() {
    this.#view.render(this.#settings.toState(), {
      [SETTING_NAMES.WIN_TILE]: this.#settings.getAllowedValues(
        SETTING_NAMES.WIN_TILE,
      ),
    })
  }

  #persist() {
    this.#storage.setJson(STORAGE_KEYS.SETTINGS, {
      version: SETTINGS_VERSION,
      ...this.#settings.toState(),
    })
  }
}
