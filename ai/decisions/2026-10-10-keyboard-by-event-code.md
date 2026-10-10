# Keyboard input is matched by `event.code`

Date: 2026-10-10 · Status: accepted

## Context

MY-118 added WASD next to the arrow keys. `event.key` is the character a key
produces, so on the Russian layout W arrives as «ц» and a letter-based mapping would
need a table per layout. `event.code` is the physical key (`KeyW`) and does not
depend on the layout.

## Decision

- Every keyboard control is matched by `event.code` through one mapping in
  `src/scripts/constants.js` (`KEY_CODE_DIRECTIONS`); `event.key` is not used.
- Keystrokes with Ctrl, Meta, or Alt, and keystrokes coming from a form field or from
  inside a dialog, are not game input: they are not `preventDefault`-ed and request
  nothing. Shift does not count as a command modifier.

## Consequences

- The mapping is by position: on AZERTY or Dvorak the keys that move tiles are the
  ones in the QWERTY WASD positions.
- An event with a `key` but no `code` (some virtual keyboards, remote desktops,
  synthetic events) does not move the board.
- Any future hotkey follows the same rules: a `code` entry in `constants.js` and the
  same guards in `KeyboardInput`. Which hotkeys exist at all is a separate question —
  see `2026-10-10-rejected-features.md` (the `N` hotkey).
