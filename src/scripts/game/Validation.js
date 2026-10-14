export class Validation {
  static isCount(value) {
    return Number.isSafeInteger(value) && value >= 0
  }

  static isTile(value) {
    if (value === 0) return true
    if (!Validation.isCount(value) || value < 2) return false

    let remainder = value

    while (remainder % 2 === 0) remainder /= 2

    return remainder === 1
  }
}
