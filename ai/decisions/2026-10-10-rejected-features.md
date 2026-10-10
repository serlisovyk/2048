# Features the author rejected

Date: 2026-10-10 · Status: accepted

## Context

While planning the Linear project 2048, a long list of ideas was reviewed with the
author. The accepted ones became Linear issues (`MY-108`…`MY-132`). The rest were
rejected on purpose, so the project stays proportional to its size.

## Decision

Do not build or propose these again unless the author explicitly asks:

| Idea                                              | Why it was rejected                                                         |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| Undo                                              | Lets players re-roll spawned tiles and cheapens the high score              |
| Seeded random / daily challenge                   | Engineering novelty with little value for the player                        |
| Move history viewer                               | Little value; depended on undo                                              |
| High contrast mode (`prefers-contrast`)           | Not worth it at this scale                                                  |
| PWA (manifest, service worker, offline)           | Overkill for this project                                                   |
| GitHub releases / tags per milestone              | Overkill for this project                                                   |
| "How to play" hint                                | The controls are self-explanatory                                           |
| Share result (Web Share API / copy)               | Overkill                                                                    |
| Shake animation on an impossible move             | Not convincing enough to add                                                |
| AI autoplay (expectimax bot)                      | Too large for the value it adds                                             |
| `N` hotkey for a new game                         | Undiscoverable without a shortcuts help screen, which is not worth building |
| Separate Lighthouse audit task                    | The author monitors Lighthouse personally                                   |
| `.editorconfig`, `.nvmrc`, `packageManager` field | Overkill — only `engines` in `package.json` is kept                         |
| Confetti on a win                                 | Overkill: the New record badge is the only celebration                      |

Also not planned (recommended against during planning, not requested): a global
leaderboard (needs a backend), sound effects, analytics, i18n.

## Consequences

- Reviews and reports should not list these as missing.
- Reversing any item needs an explicit request from the author and a new dated
  record.
