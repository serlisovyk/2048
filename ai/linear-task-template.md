# Linear task template (2048)

Every Linear issue for this repo follows the structure below. **The issue itself is
written in Russian**: the title, the section headings exactly as shown, the body, and
the checklist lines. This file explains each section in English. The `linear-tasks`
skill uses it as the source of structure when creating issues.

Drop empty or irrelevant sections — no placeholders. Sections marked _(optional)_ are
added only when there is something to say.

Issue metadata: project **2048**, the milestone matching the area of work, state
`Todo`, type labels (`Feature` / `Improvement` / `Bug` / `UI` / `Infra` / `AI`). Use a
"blocked by" relation only for a real technical dependency; otherwise "related".

The title stays short; specifics go into the body.

---

## Порядок _(optional)_

Which issues (`MY-<n>`) this one comes after and why, and which issues build on it.

## Зачем

The problem or gap today and what should change. One or two paragraphs, grounded in
the code (file, function, current behavior), focused on the observable result for the
player.

## Что сделать

A numbered list of concrete steps:

- which modules, styles, and data are touched;
- states and edge cases: swipe and keyboard, an open dialog, game over, reload,
  blocked `localStorage`, `prefers-reduced-motion`, 320px width;
- anything to be decided in the plan — phrase it as «решить в плане»; the assignee
  then stops after the plan commit and waits for the author's approval.

## Готово когда

Observable criteria that can be checked by hand — not "done", but "when X, the game
does Y".

## Риски и крайние случаи _(optional)_

What can break and which other issues it affects.

## Вне скоупа _(optional)_

What is deliberately excluded — adjacent work goes into separate issues, linked.

## Обязательно проверить и обновить

Keep the relevant lines, delete the rest. Copy them into the issue as-is:

- [ ] `ai/superpowers/` — plan (+ spec, если меняется поведение) одним коммитом до
      кода (см. `ai/workflow.md`)
- [ ] `README.md` — фичи, управление, скрипты, структура
- [ ] `ai/map.md` — если добавлен, переименован или удалён файл, модуль, ключ
      storage или скрипт
- [ ] `ai/rules/*`, `ai/skills/*` — если изменился паттерн
- [ ] `ai/decisions/` — датированная запись, если зафиксировано долгоживущее
      решение

## Проверка

Copy into the issue as-is:

- [ ] `yarn format:check`
- [ ] `yarn build`
- [ ] Прогнано руками в `yarn dev`: десктоп (клавиатура, мышь) и мобильная ширина
      (свайпы)

The project has no automated tests — verification is formatting, the build, and
playing the game in the browser. Once `yarn lint` (MY-111) and `yarn size` (MY-112)
exist, add them to this list.
