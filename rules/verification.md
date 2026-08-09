# Verification Rules

## Required Checks

After HTML, CSS, JavaScript, config, package, or documentation changes, run:

```bash
yarn format:check
yarn build
```

If formatting was intentionally changed, run:

```bash
yarn format
```

## Package Manager

- Use `yarn`, not npm or pnpm.
- Keep `yarn.lock`.
- Do not keep `package-lock.json`.
- Do not manually edit `yarn.lock` unless there is no safer option.

## Reporting

When finishing work, report:

- what changed
- which commands were run
- whether they passed
- anything that could not be verified

Do not claim the project builds or formats correctly unless the command was run
successfully.
