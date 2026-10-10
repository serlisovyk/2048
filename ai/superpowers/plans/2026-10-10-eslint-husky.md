# MY-111 — ESLint + Husky + lint-staged pre-commit hook

Issue: MY-111 · Branch: `my-111-eslint-husky`

## Versions and the `engines` range

yarn 1 checks every dependency's `engines.node` against the running Node on
install, so the tools must fit the range in `package.json`
(`^20.19.0 || >=22.12.0`, set in MY-110):

| Package                                              | Latest                             | Fits our range?                 |
| ---------------------------------------------------- | ---------------------------------- | ------------------------------- |
| `eslint` 10                                          | `^20.19.0 \|\| ^22.13.0 \|\| >=24` | Almost — not 22.12 or Node 23   |
| `@eslint/js` 10                                      | same as ESLint 10                  | Almost                          |
| `lint-staged` 17                                     | `>=22.22.1`                        | No — drops Node 20 and early 22 |
| `lint-staged` 16.4                                   | `>=20.17`                          | Yes                             |
| `husky` 9, `globals` 17, `eslint-config-prettier` 10 | `>=18` / none                      | Yes                             |

**Proposal:** ESLint 10 + `@eslint/js` 10, `lint-staged` 16.4, and narrow
`engines.node` to ESLint's own range, `^20.19.0 || ^22.13.0 || >=24` (it still
covers the Vite 7 minimum; it only drops 22.12 and the odd-numbered Node 23).

## ESLint (`eslint.config.js`, flat config)

- `@eslint/js` `recommended`.
- `src/**/*.js`: `globals.browser`, `sourceType: 'module'`.
- Root config files (`*.config.js`): `globals.node`.
- `eslint-config-prettier` last, so ESLint never fights Prettier.
- Ignores: `dist/`.
- A few rules on top of `recommended`, all already true for the current code:
  - `no-unused-vars` with `argsIgnorePattern: '^_'` (e.g. `(_, row)` in `GridView`);
  - `eqeqeq` with `null: 'ignore'` (`rawValue != null` in `SafeStorage`);
  - `prefer-const`, `no-var`.
- Two rules that enforce `ai/rules/oop.md` mechanically, scoped to `src/scripts/`:
  - `no-restricted-syntax` on `ExportDefaultDeclaration` — named exports only;
  - `no-restricted-properties` on `document.querySelector` /
    `document.querySelectorAll` everywhere except `main.js` — DOM lookup only in
    the composition root.

Scripts: `"lint": "eslint ."`, `"lint:fix": "eslint . --fix"`.

Anything the linter finds in the current code is fixed in this task (expected:
nothing or near nothing — the code was just rewritten).

## Pre-commit hook

- `husky` 9: `"prepare": "husky"` installs the hook on `yarn install`;
  `.husky/pre-commit` runs `yarn lint-staged`.
- `lint-staged` (`.lintstagedrc.json`):
  - `*.js` → `eslint --fix`, then `prettier --write`;
  - `*.{css,html,json,md}` → `prettier --write`.
- Only staged files are checked — the hook stays fast. No build in the hook; the
  full `yarn build` stays in the workflow checks (and in CI, MY-112).
- Vercel runs `yarn install` too: Husky 9 skips quietly when there is no `.git`, so
  the deploy must not break — checked on a branch preview.

## Commits

1. `docs: add plan for MY-111 eslint and pre-commit hook` (this file).
2. `build: add ESLint flat config and lint scripts` (+ `engines` change, fixes if
   any).
3. `build: add Husky and lint-staged pre-commit hook`.
4. `docs: add lint and the pre-commit hook to the workflow docs` — `README.md`,
   `AGENTS.md`, `ai/workflow.md`, `ai/rules/verification.md`,
   `ai/rules/definition-of-done.md`, `ai/linear-task-template.md`,
   `ai/task-prompt-template.md`, `ai/orchestrator-prompt-template.md`,
   `ai/map.md`.

## Verification

- `yarn lint`, `yarn format:check`, `yarn build` clean.
- A commit with a lint error (e.g. an unused variable) is blocked by the hook.
- A commit with a badly formatted file goes through already formatted.
- A fresh install sets the hook up: delete `node_modules`, `yarn install`,
  `git config core.hooksPath` → `.husky/_`.
- The OOP rules fire: a temporary `export default` or `document.querySelector` in a
  view is reported.
- Vercel preview deployment of the branch builds.

## Author's answers (2026-10-10)

1. Versions: ESLint 10 + `@eslint/js` 10, `lint-staged` 16.4, `engines.node`
   narrowed to `^20.19.0 || ^22.13.0 || >=24`.
2. The two OOP-enforcing lint rules are added.
3. The hook only lints and formats staged files; no build in the hook.
