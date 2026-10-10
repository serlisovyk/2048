# Vanilla JavaScript, no UI framework, no TypeScript

Date: 2026-10-10 · Status: accepted

## Context

The game is a single screen with a small amount of state (a board, two scores, a few
flags). It is a portfolio project meant to show clean framework-free frontend work
with production build habits (Vite, minification, legacy chunks).

## Decision

- Plain HTML, plain CSS split by responsibility, vanilla JavaScript ES modules, Vite.
- No React, Vue, Angular, or other UI framework. No TypeScript. No CSS preprocessor
  or utility framework.
- Structure grows by splitting modules along real boundaries (game logic, rendering,
  input, storage), not by adopting a framework.

## Consequences

- Any request that implies a framework or TypeScript is a reversal of this record and
  needs an explicit ask from the author and a new dated record.
- DOM updates, animation, and state flow are hand-written; keep them simple and
  documented in `ai/map.md` and the `feature` skill.
