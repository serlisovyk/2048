# Scope Rules

This is a small educational frontend game. Improve it without turning it into a
larger application template.

## Do Not Add Without Explicit Request

- React, Vue, Angular, or another UI framework
- TypeScript
- Tailwind, Bootstrap, or a component library
- Client-side routing
- Backend integrations
- Analytics scripts
- Authentication
- Server state libraries
- Test frameworks or automated tests

Tooling that **is** in scope (planned in Linear): ESLint, a Husky + lint-staged
pre-commit hook, and GitHub Actions CI with a bundle size check.

Features the author already rejected are listed in
`ai/decisions/2026-10-10-rejected-features.md` — do not propose them again.

## Prefer

- Small HTML, CSS, and JavaScript improvements
- Accessibility fixes tied to the existing game UI
- Responsive keyboard and touch controls
- Production build improvements that directly help the static game
- Practical performance optimizations

## Tradeoffs

- If a tool adds more maintenance than value, do not add it.
- If an optimization makes the source harder to understand, reconsider it.
- If a change is only useful for a much larger project, leave it out.
